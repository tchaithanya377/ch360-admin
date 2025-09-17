export const isYYYYMMDD = (value?: string | null): boolean => {
  if (!value) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

export const isISODateTime = (value?: string | null): boolean => {
  if (!value) return true;
  // Basic ISO 8601 check
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+\-]\d{2}:?\d{2})$/.test(value);
};

export const required = (value: any): boolean => value !== undefined && value !== null && String(value).trim() !== '';



