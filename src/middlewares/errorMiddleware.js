export const globalErrorHandler = (err, req, res, next) => {
  // Set defaults
  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Internal Server Error";

  // Handle specific error types (e.g., Mongoose validation errors, JWT errors)
  // response to client
  // If token is malformed, tampered with, or invalid
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    status = "fail";
    message = "Invalid token. Please log in again!";
  }
  // If token time has expired
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    status = "fail";
    message = "Token has expired. Please log in again!";
  }
  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    status = "fail";
    message = Object.values(err.errors)
      .map((el) => el.message)
      .join(". ");
  }
  // Send error response
  res.status(statusCode).json({
    status: status,
    message: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
