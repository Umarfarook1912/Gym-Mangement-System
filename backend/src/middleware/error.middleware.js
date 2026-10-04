const logger = require('../utils/logger');
const env = require('../config/env');
const { HTTP_STATUS, MESSAGES } = require('../constants');

function notFound(_req, _res, next) {
  const error = new Error(MESSAGES.NOT_FOUND);
  error.statusCode = HTTP_STATUS.NOT_FOUND;
  error.isOperational = true;
  next(error);
}

function errorHandler(err, req, res, _next) {
  let status = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.isOperational ? err.message : MESSAGES.INTERNAL_ERROR;
  let details = err.isOperational ? err.error || null : null;

  if (err.name === 'CastError') {
    status = HTTP_STATUS.BAD_REQUEST;
    message = MESSAGES.INVALID_ID;
    details = null;
  }

  if (err.name === 'ValidationError') {
    status = HTTP_STATUS.UNPROCESSABLE;
    message = MESSAGES.VALIDATION_FAILED;
    details = Object.values(err.errors).map((item) => ({ field: item.path, message: item.message }));
  }

  if (err.code === 11000) {
    status = HTTP_STATUS.CONFLICT;
    message = MESSAGES.DUPLICATE_RECORD;
    details = null;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = HTTP_STATUS.UNAUTHORIZED;
    message = MESSAGES.UNAUTHORIZED;
    details = null;
  }

  if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    logger.error(err.stack || err.message, { path: req.path, name: err.name });
    if (!env.isProduction && err.message) message = err.message;
  }

  return res.status(status).json({
    success: false,
    message,
    error: details,
  });
}

module.exports = { notFound, errorHandler };
