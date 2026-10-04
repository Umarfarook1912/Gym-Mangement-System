const env = require('../config/env');

const SENSITIVE_KEYS = ['password', 'jwt', 'token', 'smtp', 'authorization', 'secret'];

function sanitize(meta) {
  if (!meta || typeof meta !== 'object') {
    return meta;
  }

  return Object.entries(meta).reduce((safe, [key, value]) => {
    const lowered = key.toLowerCase();
    const hidden = SENSITIVE_KEYS.some((sensitive) => lowered.includes(sensitive));
    safe[key] = hidden ? '[redacted]' : value;
    return safe;
  }, {});
}

function write(level, message, meta) {
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...(meta ? { meta: sanitize(meta) } : {}),
  };
  const line = JSON.stringify(entry);
  if (level === 'error') {
    process.stderr.write(`${line}\n`);
    if (!env.isProduction) process.stdout.write(`${line}\n`);
    return;
  }
  if (!env.isProduction || level === 'info') {
    process.stdout.write(`${line}\n`);
  }
}

const logger = {
  info: (message, meta) => write('info', message, meta),
  error: (message, meta) => write('error', message, meta),
  warn: (message, meta) => write('warn', message, meta),
};

module.exports = logger;
