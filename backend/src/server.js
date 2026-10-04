const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { connectDB } = require('./config/db');

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    logger.info('Server started', { port: env.port });
  });
}

if (!env.isVercel) {
  start().catch((error) => {
    logger.error('Server failed to start', { message: error.message });
    process.exit(1);
  });
}

module.exports = app;
