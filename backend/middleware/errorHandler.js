// middleware/errorHandler.js
// Unified JSON error format: { error: { code, message, details? } }
export function notFound(req, res, next) {
  res
    .status(404)
    .json({
      error: {
        code: "NOT_FOUND",
        message: "Resource not found",
        details: { path: req.originalUrl },
      },
    });
}

export function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  const status = err.status || err.httpCode || 500;
  const code = err.code || (status === 500 ? "INTERNAL_ERROR" : "ERROR");
  const payload = {
    error: {
      code,
      message: err.message || "Internal server error",
    },
  };
  if (err.details) payload.error.details = err.details;
  if (process.env.NODE_ENV !== "production" && err.stack) {
    payload.error.stack = err.stack;
  }
  res.status(status).json(payload);
}

// Helper to wrap async routes
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
