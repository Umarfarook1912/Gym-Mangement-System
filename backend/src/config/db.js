const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const { HTTP_STATUS, MESSAGES } = require('../constants');

let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!env.mongoUri) {
    throw new AppError(MESSAGES.DATABASE_NOT_CONFIGURED, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.mongoUri)
      .then((conn) => {
        logger.info('Database connected');
        return conn;
      })
      .catch((error) => {
        connectionPromise = null;
        logger.error('Database connection failed', { message: error.message });
        throw new AppError(MESSAGES.DATABASE_CONNECTION_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR);
      });
  }

  return connectionPromise;
}

module.exports = { connectDB };
