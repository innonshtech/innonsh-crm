import { z } from 'zod';

const envSchema = z.object({
  // Required in production
  DATABASE_URL: z.string().url("Must be a valid URL"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
  
  // Optional / Defaultable
  PORT: z.string().optional().default("3000"),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_NAME: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().optional(),
  
  // App
  APP_URL: z.string().url().optional(),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  
  // Other
  WEBSITE_API_KEY: z.string().optional(),
});

// We only want to parse environment variables on the server side
// Or next.config.js will complain.
const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
};

export const env = parseEnv();
