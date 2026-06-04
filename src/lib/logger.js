import winston from 'winston';

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

export const auditLog = (action, userId, details) => {
  logger.info(`AUDIT: ${action}`, {
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  });
};

export default logger;
