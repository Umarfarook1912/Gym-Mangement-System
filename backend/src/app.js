const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const { sendSuccess } = require('./utils/apiResponse');
const { MESSAGES, TIME } = require('./constants');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: TIME.JSON_BODY_LIMIT }));
app.use(mongoSanitize());

app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/', (_req, res) => {
  sendSuccess(res, { message: MESSAGES.HEALTH_OK, data: { status: 'ok' } });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
