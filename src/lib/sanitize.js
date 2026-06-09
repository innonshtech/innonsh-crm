import xss from 'xss';

/**
 * Deep sanitizes strings within an object/array using xss to prevent XSS attacks.
 * @param {any} data - The data to sanitize.
 * @returns {any} - The sanitized data.
 */
export function sanitizePayload(data) {
  if (typeof data === 'string') {
    return xss(data.trim());
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizePayload(item));
  }

  if (data !== null && typeof data === 'object') {
    const sanitizedObj = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitizedObj[key] = sanitizePayload(data[key]);
      }
    }
    return sanitizedObj;
  }

  return data; // Numbers, booleans, null, undefined
}
