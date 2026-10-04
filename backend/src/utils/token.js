const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('./AppError');
const { HTTP_STATUS, MESSAGES } = require('../constants');

function signAuthToken(payload) {
  if (!env.jwtSecret) {
    throw new AppError(MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function verifyAuthToken(token) {
  if (!env.jwtSecret) {
    throw new AppError(MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { signAuthToken, verifyAuthToken };
