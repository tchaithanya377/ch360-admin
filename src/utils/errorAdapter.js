// Maps DRF and common API error shapes to field and non-field errors

export function adaptApiError(error) {
  if (!error) return { message: 'Unknown error', fieldErrors: {} };

  // If error is an Error instance
  if (error instanceof Error) {
    return { message: error.message, fieldErrors: {} };
  }

  // If server provided structured JSON
  const msg = error.detail || error.message || error.error || 'Request failed';
  const fieldErrors = {};

  // Collect field errors from DRF serializer style
  Object.entries(error).forEach(([key, value]) => {
    if (key === 'non_field_errors' || key === 'detail' || key === 'message' || key === 'error') return;
    if (Array.isArray(value)) fieldErrors[key] = value.map(String).join(' ');
    else if (typeof value === 'string') fieldErrors[key] = value;
  });

  return { message: msg, fieldErrors };
}


