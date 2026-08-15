// Small helper so route handlers can throw a typed error with a status code.
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Centralized error handler - keeps route handlers free of try/catch boilerplate
// via asyncHandler, and guarantees the client always gets JSON, never a raw stack trace.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong. Please try again.' : err.message;
  if (status === 500) {
    console.error(err);
  }
  res.status(status).json({ error: message });
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { ApiError, errorHandler, asyncHandler };
