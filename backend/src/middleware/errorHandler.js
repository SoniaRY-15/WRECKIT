// logging reqs
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
};

export const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();

  // log error details
  console.error(`[${timestamp}] ERROR: ${err.message}`);
  console.error(`Stack: ${err.stack}`);

  // default error response, bisa diganti
  let statusCode = err.statusCode || 500;
  let errorResponse = {
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected error occurred",
    timestamp,
  };

  if (err.name === "ValidationError") {
    statusCode = 400;
    errorResponse.details = err.details;
  } else if (err.name === "NotFoundError") {
    statusCode = 404;
  } else if (err.name === "AIServiceError") {
    statusCode = 503;
    errorResponse.message = "AI service is temporarily unavailable";
  }

  res.status(statusCode).json(errorResponse);
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
