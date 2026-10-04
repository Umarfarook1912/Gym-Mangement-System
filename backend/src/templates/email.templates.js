const { ANNOUNCEMENT_TYPES, DEFAULT_GYM_NAME, TIME } = require('../constants');
const env = require('../config/env');

const TYPE_LABELS = {
  [ANNOUNCEMENT_TYPES.TIMING]: 'Gym timing',
  [ANNOUNCEMENT_TYPES.MAINTENANCE]: 'Maintenance',
  [ANNOUNCEMENT_TYPES.IMPORTANT]: 'Important',
};

const RESET_HOURS = Math.round(TIME.RESET_TOKEN_TTL_MS / (60 * 60 * 1000));

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function detailsTable(rows) {
  const body = rows
    .map(
      (row) => `<tr>
        <td width="38%" valign="top" style="padding:12px 16px;border-bottom:1px solid #2A2A2A;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#A1A1A1;">${escapeHtml(row.label)}</td>
        <td valign="top" style="padding:12px 16px;border-bottom:1px solid #2A2A2A;font-family:${row.mono ? 'Consolas,Courier New,monospace' : 'Arial,Helvetica,sans-serif'};font-size:14px;line-height:20px;font-weight:700;color:#FFFFFF;">${escapeHtml(row.value)}</td>
      </tr>`
    )
    .join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #2A2A2A;border-collapse:collapse;background:#101010;">
    ${body}
  </table>`;
}

function button(href, label) {
  const safeHref = escapeHtml(href);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;">
    <tr>
      <td bgcolor="#F5B800" style="border-radius:8px;">
        <a href="${safeHref}" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;line-height:20px;color:#0B0B0B;text-decoration:none;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>
  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6B6B6B;word-break:break-all;">${safeHref}</p>`;
}

function layout({ title, intro, rows, extra, gymName = DEFAULT_GYM_NAME }) {
  const name = escapeHtml(gymName);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#0B0B0B;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0B0B0B" style="background:#0B0B0B;">
      <tr>
        <td align="center" style="padding:32px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#141414;border:1px solid #2A2A2A;">
            <tr>
              <td bgcolor="#F5B800" height="4" style="height:4px;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:28px 32px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;letter-spacing:2px;text-transform:uppercase;color:#F5B800;">${name}</td>
            </tr>
            <tr>
              <td style="padding:10px 32px 0;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:32px;font-weight:700;color:#FFFFFF;">${escapeHtml(title)}</td>
            </tr>
            <tr>
              <td style="padding:16px 32px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#A1A1A1;">${intro}</td>
            </tr>
            ${rows?.length ? `<tr><td style="padding:20px 32px 0;">${detailsTable(rows)}</td></tr>` : ''}
            ${extra ? `<tr><td style="padding:20px 32px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#A1A1A1;">${extra}</td></tr>` : ''}
            <tr>
              <td style="padding:28px 32px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6B6B6B;">
                ${name}<br />
                This is an automated message about your membership. Please do not reply.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function registrationTemplate({ fullName, memberId, email, temporaryPassword, planName, endDate, gymName }) {
  return layout({
    gymName,
    title: 'Welcome to the gym',
    intro: `Hello ${escapeHtml(fullName)},<br /><br />Your membership is active. Sign in with the details in the table below, then change the temporary password.`,
    rows: [
      { label: 'Member ID', value: memberId },
      { label: 'Email', value: email },
      { label: 'Temporary password', value: temporaryPassword, mono: true },
      { label: 'Plan', value: planName },
      { label: 'Valid until', value: endDate },
    ],
    extra: button(`${env.frontendUrl}/login`, 'Sign in'),
  });
}

function expiryTemplate({ fullName, endDate, planName, gymName }) {
  return layout({
    gymName,
    title: 'Membership ends today',
    intro: `Hello ${escapeHtml(fullName)},<br /><br />Today is the last day of your membership. Renew at the front desk to keep your access.`,
    rows: [
      { label: 'Plan', value: planName },
      { label: 'Ends on', value: endDate },
    ],
  });
}

function announcementTemplate({ title, body, type, gymName }) {
  return layout({
    gymName,
    title: 'Gym announcement',
    intro: 'A new update has been posted for members.',
    rows: [
      { label: 'Type', value: TYPE_LABELS[type] || 'Announcement' },
      { label: 'Title', value: title },
    ],
    extra: escapeHtml(body).replace(/\n/g, '<br />'),
  });
}

function resetTemplate({ fullName, resetUrl, gymName }) {
  return layout({
    gymName,
    title: 'Reset your password',
    intro: `Hello ${escapeHtml(fullName)},<br /><br />Use the button below to choose a new password. The link works once and then expires.`,
    rows: [{ label: 'Link expires', value: `${RESET_HOURS} hour${RESET_HOURS === 1 ? '' : 's'}` }],
    extra: button(resetUrl, 'Reset password'),
  });
}

module.exports = {
  registrationTemplate,
  expiryTemplate,
  announcementTemplate,
  resetTemplate,
};
