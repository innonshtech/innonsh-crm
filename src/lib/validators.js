/**
 * src/lib/validators.js
 * ---------------------
 * Central Zod validation schemas for all API routes.
 * Usage:
 *   import { schemas, validate } from '@/lib/validators';
 *   const parsed = validate(schemas.login, body);
 *   if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
 */
import { z } from 'zod';

// ─── Helper: strip HTML tags to prevent XSS stored in text fields ────────────
const sanitizedString = (maxLen = 500) =>
  z.string()
    .max(maxLen, { message: `Maximum ${maxLen} characters allowed.` })
    .transform((v) => v.replace(/<[^>]*>/g, '').trim());

const optionalString = (maxLen = 500) =>
  z.string()
    .max(maxLen, { message: `Maximum ${maxLen} characters allowed.` })
    .transform((v) => v.replace(/<[^>]*>/g, '').trim())
    .optional()
    .or(z.literal(''));

const emailField = z
  .string()
  .email({ message: 'A valid email address is required.' })
  .max(254)
  .transform((v) => v.toLowerCase().trim());

const passwordField = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long.' })
  .max(128, { message: 'Password is too long.' });

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, { message: 'Password is required.' }).max(128),
});

export const registerSchema = z.object({
  companyName: sanitizedString(150),
  name: sanitizedString(100),
  email: emailField,
  password: passwordField,
  sector: z.string().max(100).optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Reset token is required.' }).max(2048),
  newPassword: passwordField,
});

// ─── Lead Schemas ─────────────────────────────────────────────────────────────

const LEAD_STATUSES = ['New', 'Contacted', 'Attempted', 'Qualified', 'Lost'];
const LEAD_PRIORITIES = ['Hot', 'Warm', 'Cold'];
const LEAD_SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Social Media', 'Trade Show', 'Other'];

export const createLeadSchema = z.object({
  firstName: sanitizedString(100),
  lastName: optionalString(100),
  company: optionalString(200),
  designation: optionalString(100),
  email: z.string().email({ message: 'Invalid email address.' }).max(254).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  whatsapp: z.string().max(20).optional().or(z.literal('')),
  website: z.string().url({ message: 'Invalid website URL.' }).max(500).optional().or(z.literal('')),
  city: optionalString(100),
  state: optionalString(100),
  country: optionalString(100),
  industry: optionalString(100),
  employeeCount: z.number().min(0).max(9_999_999).optional(),
  annualRevenue: z.number().min(0).max(99_999_999_999).optional(),
  priority: z.enum(LEAD_PRIORITIES).optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  lostReason: optionalString(500),
  source: z.enum(LEAD_SOURCES).optional(),
  requirements: optionalString(2000),
  nextFollowUpDate: z.string().datetime({ offset: true }).optional().or(z.literal('')),
  assignedTo: z.string().uuid().optional().or(z.literal('')),
  customFields: z.array(z.any()).max(50).optional(),
  interestedProduct: optionalString(200),
  followUpType: z.string().max(50).optional(),
  isPublic: z.boolean().optional(),
  autoAssign: z.boolean().optional(),
  custom_data: z.record(z.any()).optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

// ─── Contact Schemas ──────────────────────────────────────────────────────────

export const createContactSchema = z.object({
  firstName: sanitizedString(100),
  lastName: optionalString(100),
  company: optionalString(200),
  designation: optionalString(100),
  email: z.string().email({ message: 'Invalid email address.' }).max(254).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  whatsapp: z.string().max(20).optional().or(z.literal('')),
  city: optionalString(100),
  state: optionalString(100),
  country: optionalString(100),
  industry: optionalString(100),
  notes: optionalString(2000),
});

export const updateContactSchema = createContactSchema.partial();

// ─── Deal Schemas ─────────────────────────────────────────────────────────────

const DEAL_STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

export const createDealSchema = z.object({
  title: sanitizedString(200),
  value: z.number().min(0).max(99_999_999_999).optional(),
  stage: z.enum(DEAL_STAGES).optional(),
  closeDate: z.string().datetime({ offset: true }).optional().or(z.literal('')),
  description: optionalString(2000),
  contactId: z.string().uuid().optional().or(z.literal('')),
  leadId: z.string().uuid().optional().or(z.literal('')),
  assignedTo: z.string().uuid().optional().or(z.literal('')),
});

export const updateDealSchema = createDealSchema.partial();

// ─── Task Schemas ─────────────────────────────────────────────────────────────

export const createTaskSchema = z.object({
  subject: sanitizedString(300),
  description: optionalString(2000),
  dueDate: z.string().datetime({ offset: true }).optional().or(z.literal('')),
  priority: z.enum(['High', 'Medium', 'Low']).optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Cancelled']).optional(),
  assignedTo: z.string().uuid().optional().or(z.literal('')),
  leadId: z.string().uuid().optional().or(z.literal('')),
});

export const updateTaskSchema = createTaskSchema.partial();

// ─── User Management Schemas ──────────────────────────────────────────────────

export const createUserSchema = z.object({
  name: sanitizedString(100),
  email: emailField,
  password: passwordField,
  role: z.enum(['owner', 'sales_admin', 'sales_rep']),
  orgId: z.string().uuid().optional(),
});

export const updateUserSchema = z.object({
  name: sanitizedString(100).optional(),
  email: emailField.optional(),
  role: z.enum(['owner', 'sales_admin', 'sales_rep']).optional(),
  isActive: z.boolean().optional(),
});

// ─── Shared helper ────────────────────────────────────────────────────────────

/**
 * Validates a payload against a Zod schema.
 * Returns { success: true, data } or { success: false, error: <human string> }.
 */
export function validate(schema, payload) {
  const result = schema.safeParse(payload);
  if (result.success) {
    return { success: true, data: result.data };
  }
  // Extract the first human-readable error message
  const firstIssue = result.error.issues[0];
  const fieldPath = firstIssue.path.length > 0 ? `${firstIssue.path.join('.')}: ` : '';
  return { success: false, error: `${fieldPath}${firstIssue.message}` };
}

export const schemas = {
  login: loginSchema,
  register: registerSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  createLead: createLeadSchema,
  updateLead: updateLeadSchema,
  createContact: createContactSchema,
  updateContact: updateContactSchema,
  createDeal: createDealSchema,
  updateDeal: updateDealSchema,
  createTask: createTaskSchema,
  updateTask: updateTaskSchema,
  createUser: createUserSchema,
  updateUser: updateUserSchema,
};
