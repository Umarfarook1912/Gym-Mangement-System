const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

let transporter = null;

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.password,
      },
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, html }) {
  const mailer = getTransporter();
  if (!mailer) {
    if (!env.isProduction) {
      logger.info('Email skipped because SMTP is not configured', { to, subject });
    }
    return { skipped: true };
  }

  await mailer.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
  });
  return { skipped: false };
}

module.exports = { sendEmail };
