import winston from 'winston';
import { supabase } from '@/lib/supabaseClient';

// Configure Winston Logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'crm-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
    })
  ],
});

export const auditLog = async (action, userId, details) => {
  logger.info(`AUDIT: ${action}`, {
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  });

  if (supabase) {
    try {
      await supabase.from('audit_logs').insert([{
        action,
        user_id: userId === 'system' ? null : userId,
        org_id: details?.orgId || null,
        resource_type: details?.resourceType || null,
        resource_id: details?.resourceId || null,
        details: typeof details === 'object' ? details : { raw: details },
        ip_address: details?.ip || null
      }]);
    } catch (e) {
      console.warn('Failed to insert audit log to Supabase', e);
    }
  }
};

export default logger;
