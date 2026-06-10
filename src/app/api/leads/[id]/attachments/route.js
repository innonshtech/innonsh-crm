import connectToDatabase from '@/lib/db';
import Lead from '@/lib/models/Lead';
import { supabase } from '@/lib/supabaseClient';
import { getUserFromRequest, checkLeadEditPermission } from '@/lib/auth';
import { uploadFileToStorage, deleteFileFromStorage, getSignedUrl } from '@/lib/storage';
import { NextResponse } from 'next/server';

// ─── Helper: parse multipart/form-data OR fallback JSON (legacy Base64) ───────
async function parseUploadRequest(req) {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    // Modern path: actual binary file upload via FormData
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      throw new Error('No file found in multipart form data.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      mode: 'storage',
      fileBuffer: buffer,
      fileName: file.name,
      fileType: file.type,
      fileSize: buffer.byteLength,
      fileData: null, // no Base64
    };
  }

  // Legacy path: JSON with Base64 fileData (backward compatible)
  const body = await req.json();
  return {
    mode: 'base64',
    fileBuffer: null,
    fileName: body.fileName,
    fileType: body.fileType || '',
    fileSize: body.fileSize || 0,
    fileData: body.fileData,
  };
}

// POST /api/leads/[id]/attachments - Upload a file attachment (Supabase Storage or Base64 fallback)
export async function POST(req, { params }) {
  try {
    const decodedUser = getUserFromRequest(req);
    const { id } = await params;

    if (!decodedUser) {
      return NextResponse.json({ error: 'Unauthorized. Please login to upload files.' }, { status: 401 });
    }

    let uploadData;
    try {
      uploadData = await parseUploadRequest(req);
    } catch (parseErr) {
      return NextResponse.json({ error: parseErr.message }, { status: 400 });
    }

    const { mode, fileBuffer, fileName, fileType, fileSize, fileData } = uploadData;

    if (!fileName) {
      return NextResponse.json({ error: 'File name is required.' }, { status: 400 });
    }

    if (mode === 'base64' && !fileData) {
      return NextResponse.json({ error: 'File data is required.' }, { status: 400 });
    }

    // Max 10MB check
    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Please upload files under 10MB.' },
        { status: 400 }
      );
    }

    let rolesPermissions = {};
    if (supabase && decodedUser.orgId) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('roles_permissions')
        .eq('id', decodedUser.orgId)
        .maybeSingle();
      if (orgData && orgData.roles_permissions) {
        rolesPermissions = orgData.roles_permissions;
      }
    }

    if (supabase) {
      const { data: leadRaw, error: fetchError } = await supabase
        .from('leads')
        .select('id, assigned_to, created_by, creator:users!leads_created_by_fkey(id, role), visibility_scope')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!leadRaw) {
        return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
      }

      const lead = {
        ...leadRaw,
        is_public: leadRaw.visibility_scope === 'GLOBAL',
        isPublic: leadRaw.visibility_scope === 'GLOBAL',
        created_by_role: leadRaw.creator ? leadRaw.creator.role : 'sales_rep',
        createdByRole: leadRaw.creator ? leadRaw.creator.role : 'sales_rep',
      };

      if (!checkLeadEditPermission(lead, decodedUser, rolesPermissions)) {
        return NextResponse.json(
          { error: 'Forbidden. You do not have permission to modify this lead.' },
          { status: 403 }
        );
      }

      let storagePath = null;
      let fileUrl = null;
      let savedFileData = null;

      if (mode === 'storage' && fileBuffer) {
        // ✅ NEW PATH: Upload binary file to Supabase Storage
        try {
          const result = await uploadFileToStorage(
            fileBuffer,
            fileType,
            fileName,
            decodedUser.orgId || 'global',
            id
          );
          storagePath = result.storagePath;
          fileUrl = result.fileUrl;
        } catch (storageErr) {
          return NextResponse.json({ error: storageErr.message }, { status: 400 });
        }
      } else {
        // ⬅️ LEGACY PATH: Keep Base64 for backward compatibility
        savedFileData = fileData;
      }

      // Insert attachment record — only URL stored, no Base64 blob
      const { error: insertError } = await supabase
        .from('lead_attachments')
        .insert([{
          lead_id: id,
          file_name: fileName,
          file_data: savedFileData,       // null for new uploads (Supabase Storage path)
          file_url: fileUrl,              // signed URL (renewed on GET)
          storage_path: storagePath,      // permanent path used to regenerate signed URLs
          file_type: fileType || '',
          file_size: Number(fileSize) || 0,
          uploaded_by: decodedUser.name,
        }]);

      if (insertError) throw insertError;

      // Activity log note
      await supabase
        .from('lead_notes')
        .insert([{
          lead_id: id,
          text: `File "${fileName}" uploaded by ${decodedUser.name}`,
          created_by: decodedUser.id,
          created_by_name: decodedUser.name,
        }]);

      // Return current attachments (signed URLs refreshed)
      const { data: attachments } = await supabase
        .from('lead_attachments')
        .select('*')
        .eq('lead_id', id);

      const mappedAttachments = await Promise.all(
        (attachments || []).map(async (a) => {
          let resolvedUrl = a.file_url;
          // Refresh signed URL if this is a Storage-backed file
          if (a.storage_path) {
            try {
              resolvedUrl = await getSignedUrl(a.storage_path);
            } catch (_) {
              resolvedUrl = a.file_url; // fallback to stored URL
            }
          }
          return {
            _id: a.id,
            id: a.id,
            fileName: a.file_name,
            fileUrl: resolvedUrl,
            storagePath: a.storage_path,
            fileData: a.file_data,   // for legacy Base64 records
            fileType: a.file_type,
            fileSize: a.file_size,
            uploadedBy: a.uploaded_by,
            uploadedAt: a.uploaded_at,
          };
        })
      );

      return NextResponse.json({
        success: true,
        message: 'Attachment uploaded successfully',
        attachments: mappedAttachments,
      }, { status: 201 });

    } else {
      // MongoDB fallback (Base64 kept for legacy compatibility)
      await connectToDatabase();
      const lead = await Lead.findById(id).populate('createdBy', 'name email role');

      if (!lead) {
        return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
      }

      if (!checkLeadEditPermission(lead, decodedUser)) {
        return NextResponse.json(
          { error: 'Forbidden. You do not have permission to modify this lead.' },
          { status: 403 }
        );
      }

      lead.attachments.push({
        fileName,
        fileData: fileData || '',
        fileType: fileType || '',
        fileSize: Number(fileSize) || 0,
        uploadedBy: decodedUser.name,
        uploadedAt: new Date(),
      });

      lead.notes.push({
        text: `File "${fileName}" uploaded by ${decodedUser.name}`,
        createdBy: decodedUser.id,
        createdByName: decodedUser.name,
      });

      await lead.save();

      return NextResponse.json({
        success: true,
        message: 'Attachment uploaded successfully',
        attachments: lead.attachments,
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Upload attachment error:', error);
    return NextResponse.json(
      { error: 'Internal server error while uploading attachment.', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/[id]/attachments - Delete an attachment (+ remove from Supabase Storage)
export async function DELETE(req, { params }) {
  try {
    const decodedUser = getUserFromRequest(req);
    const { id } = await params;

    if (!decodedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const attachmentId = searchParams.get('attachmentId');

    if (!attachmentId) {
      return NextResponse.json({ error: 'Attachment ID is required.' }, { status: 400 });
    }

    let rolesPermissions = {};
    if (supabase && decodedUser.orgId) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('roles_permissions')
        .eq('id', decodedUser.orgId)
        .maybeSingle();
      if (orgData && orgData.roles_permissions) {
        rolesPermissions = orgData.roles_permissions;
      }
    }

    if (supabase) {
      const { data: leadRaw, error: fetchError } = await supabase
        .from('leads')
        .select('id, assigned_to, created_by, creator:users!leads_created_by_fkey(id, role), visibility_scope')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!leadRaw) {
        return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
      }

      const lead = {
        ...leadRaw,
        is_public: leadRaw.visibility_scope === 'GLOBAL',
        isPublic: leadRaw.visibility_scope === 'GLOBAL',
        created_by_role: leadRaw.creator ? leadRaw.creator.role : 'sales_rep',
        createdByRole: leadRaw.creator ? leadRaw.creator.role : 'sales_rep',
      };

      if (!checkLeadEditPermission(lead, decodedUser, rolesPermissions)) {
        return NextResponse.json(
          { error: 'Forbidden. You do not have permission to modify this lead.' },
          { status: 403 }
        );
      }

      // Fetch attachment to get storage_path before deletion
      const { data: attachmentToRemove } = await supabase
        .from('lead_attachments')
        .select('file_name, storage_path')
        .eq('id', attachmentId)
        .eq('lead_id', id)
        .maybeSingle();

      if (!attachmentToRemove) {
        return NextResponse.json({ error: 'Attachment not found.' }, { status: 404 });
      }

      const removedFileName = attachmentToRemove.file_name;

      // 1. Delete the actual file from Supabase Storage (if it was uploaded there)
      if (attachmentToRemove.storage_path) {
        await deleteFileFromStorage(attachmentToRemove.storage_path);
      }

      // 2. Delete the DB record
      const { error: deleteError } = await supabase
        .from('lead_attachments')
        .delete()
        .eq('id', attachmentId);

      if (deleteError) throw deleteError;

      // 3. Log deletion
      await supabase
        .from('lead_notes')
        .insert([{
          lead_id: id,
          text: `File "${removedFileName}" deleted by ${decodedUser.name}`,
          created_by: decodedUser.id,
          created_by_name: decodedUser.name,
        }]);

      // Return remaining attachments
      const { data: remaining } = await supabase
        .from('lead_attachments')
        .select('*')
        .eq('lead_id', id);

      const mappedAttachments = await Promise.all(
        (remaining || []).map(async (a) => {
          let resolvedUrl = a.file_url;
          if (a.storage_path) {
            try { resolvedUrl = await getSignedUrl(a.storage_path); } catch (_) {}
          }
          return {
            _id: a.id,
            id: a.id,
            fileName: a.file_name,
            fileUrl: resolvedUrl,
            storagePath: a.storage_path,
            fileData: a.file_data,
            fileType: a.file_type,
            fileSize: a.file_size,
            uploadedBy: a.uploaded_by,
            uploadedAt: a.uploaded_at,
          };
        })
      );

      return NextResponse.json({
        success: true,
        message: 'Attachment deleted successfully',
        attachments: mappedAttachments,
      });

    } else {
      // MongoDB fallback
      await connectToDatabase();
      const lead = await Lead.findById(id).populate('createdBy', 'name email role');

      if (!lead) {
        return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
      }

      if (!checkLeadEditPermission(lead, decodedUser)) {
        return NextResponse.json(
          { error: 'Forbidden. You do not have permission to modify this lead.' },
          { status: 403 }
        );
      }

      const attachmentToRemove = lead.attachments.id(attachmentId);
      if (!attachmentToRemove) {
        return NextResponse.json({ error: 'Attachment not found.' }, { status: 404 });
      }

      const removedFileName = attachmentToRemove.fileName;
      lead.attachments.pull(attachmentId);
      lead.notes.push({
        text: `File "${removedFileName}" deleted by ${decodedUser.name}`,
        createdBy: decodedUser.id,
        createdByName: decodedUser.name,
      });

      await lead.save();

      return NextResponse.json({
        success: true,
        message: 'Attachment deleted successfully',
        attachments: lead.attachments,
      });
    }
  } catch (error) {
    console.error('Delete attachment error:', error);
    return NextResponse.json(
      { error: 'Internal server error while removing attachment.' },
      { status: 500 }
    );
  }
}
