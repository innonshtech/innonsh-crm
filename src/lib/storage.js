/**
 * src/lib/storage.js
 * ------------------
 * Supabase Storage helper for the CRM file upload system.
 * All files are stored in the 'crm-attachments' private bucket.
 * Download links are served as time-limited signed URLs (1 hour).
 *
 * Allowed MIME types and 10MB max size are enforced here before upload.
 */
import { getSupabaseClient } from '@/lib/supabaseClient';

const BUCKET = 'crm-attachments';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
];

/**
 * Upload a file Buffer to Supabase Storage.
 *
 * @param {Buffer} fileBuffer - Raw file bytes
 * @param {string} mimeType   - MIME type (e.g. 'application/pdf')
 * @param {string} fileName   - Original file name (for path generation)
 * @param {string} orgId      - Organization ID (used as folder prefix for isolation)
 * @param {string} leadId     - Lead ID (used as sub-folder)
 * @returns {{ storagePath: string, fileUrl: string }}
 */
export async function uploadFileToStorage(fileBuffer, mimeType, fileName, orgId, leadId) {
  const supabase = getSupabaseClient();

  // --- Validation ---
  if (fileBuffer.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new Error('File size too large. Please upload files under 10MB.');
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`File type "${mimeType}" is not allowed. Permitted: PDF, Word, Excel, PowerPoint, images, CSV, ZIP.`);
  }

  // Sanitize filename — remove path traversal characters
  const safeName = fileName.replace(/[^a-zA-Z0-9._\-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `${orgId}/${leadId}/${timestamp}_${safeName}`;

  // --- Upload ---
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    console.error('Supabase Storage upload error:', uploadError);
    throw new Error(`File upload failed: ${uploadError.message}`);
  }

  // --- Generate a 1-hour signed URL for immediate response ---
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 60); // 1 hour

  if (signedUrlError) {
    console.error('Supabase Storage signed URL error:', signedUrlError);
    throw new Error('File uploaded but failed to generate download URL.');
  }

  return {
    storagePath,
    fileUrl: signedUrlData.signedUrl,
  };
}

/**
 * Generate a fresh signed URL for an existing file in storage.
 * Call this whenever a user wants to download a file (URLs expire after 1 hour).
 *
 * @param {string} storagePath - The path returned from uploadFileToStorage
 * @param {number} expiresInSeconds - How long the URL is valid (default: 1 hour)
 * @returns {string} Signed URL
 */
export async function getSignedUrl(storagePath, expiresInSeconds = 3600) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error) {
    throw new Error(`Failed to generate download URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Delete a file from Supabase Storage.
 *
 * @param {string} storagePath - The storage path to delete
 */
export async function deleteFileFromStorage(storagePath) {
  if (!storagePath) return; // Nothing to delete (old Base64 records have no storagePath)

  const supabase = getSupabaseClient();

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath]);

  if (error) {
    // Log but don't throw — DB record deletion should still proceed
    console.error('Supabase Storage delete error:', error.message);
  }
}
