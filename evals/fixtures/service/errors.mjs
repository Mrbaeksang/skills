export function errorResponse(error) {
  return { error: { code: error.code || 'INTERNAL', message: error.message } };
}
