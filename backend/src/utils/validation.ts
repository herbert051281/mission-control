import { AppError } from '../middleware/errorHandler';

export const validateRequired = (data: Record<string, unknown>, fields: string[]) => {
  const missing: string[] = [];
  fields.forEach((field) => {
    if (!data[field]) missing.push(field);
  });
  if (missing.length > 0) {
    throw new AppError(400, 'Validation error', { missing_fields: missing });
  }
};

export const validateEnum = (value: string, allowedValues: string[], fieldName: string) => {
  if (!allowedValues.includes(value)) {
    throw new AppError(400, `Invalid ${fieldName}`, {
      received: value,
      allowed: allowedValues,
    });
  }
};

export const validateUUID = (id: string, fieldName = 'id') => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new AppError(400, `Invalid ${fieldName} format`);
  }
};

export const validatePagination = (limit?: string, offset?: string) => {
  const l = limit ? parseInt(limit, 10) : 10;
  const o = offset ? parseInt(offset, 10) : 0;
  if (l < 1 || l > 100) throw new AppError(400, 'Limit must be 1-100');
  if (o < 0) throw new AppError(400, 'Offset must be >= 0');
  return { limit: l, offset: o };
};
