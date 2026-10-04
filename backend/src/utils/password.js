const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { TIME, LIMITS } = require('../constants');

async function hashPassword(password) {
  return bcrypt.hash(password, TIME.BCRYPT_ROUNDS);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  return {
    token,
    hash: hashToken(token),
    expiresAt: new Date(Date.now() + TIME.RESET_TOKEN_TTL_MS),
  };
}

function createTemporaryPassword() {
  return crypto.randomBytes(LIMITS.TEMP_PASSWORD_LENGTH).toString('base64url').slice(0, LIMITS.TEMP_PASSWORD_LENGTH);
}

module.exports = {
  hashPassword,
  comparePassword,
  hashToken,
  createResetToken,
  createTemporaryPassword,
};
