const Admin = require('../models/admin.model');
const Member = require('../models/member.model');
const AppError = require('../utils/AppError');
const { comparePassword, hashPassword, createResetToken, hashToken } = require('../utils/password');
const { signAuthToken } = require('../utils/token');
const { sendEmail } = require('./email.service');
const { resetTemplate } = require('../templates/email.templates');
const env = require('../config/env');
const logger = require('../utils/logger');
const { USER_ROLES, ACCOUNT_STATUS, HTTP_STATUS, MESSAGES, EMAIL_SUBJECTS } = require('../constants');

async function findAccountByEmail(email) {
  const normalized = email.trim().toLowerCase();
  const admin = await Admin.findOne({ email: normalized }).select('+password +resetPasswordTokenHash +resetPasswordExpires');
  if (admin) return { account: admin, role: USER_ROLES.ADMIN };
  const member = await Member.findOne({ email: normalized }).select('+password +resetPasswordTokenHash +resetPasswordExpires');
  if (member) return { account: member, role: USER_ROLES.MEMBER };
  return null;
}

function publicProfile(account, role) {
  return {
    id: account.id,
    role,
    fullName: account.fullName,
    email: account.email,
    phone: account.phone || '',
    status: account.status,
    memberId: account.memberId || null,
  };
}

async function login({ email, password }) {
  const found = await findAccountByEmail(email);
  if (!found) {
    throw new AppError(MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  }
  const matches = await comparePassword(password, found.account.password);
  if (!matches) {
    throw new AppError(MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  }
  if (found.account.status !== ACCOUNT_STATUS.ACTIVE) {
    throw new AppError(MESSAGES.ACCOUNT_INACTIVE, HTTP_STATUS.FORBIDDEN);
  }

  const token = signAuthToken({ id: found.account.id, role: found.role });
  return { token, user: publicProfile(found.account, found.role) };
}

async function getProfile(user) {
  const Model = user.role === USER_ROLES.ADMIN ? Admin : Member;
  const account = await Model.findById(user.id);
  if (!account) {
    throw new AppError(MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  return publicProfile(account, user.role);
}

async function updateAdminProfile(userId, payload) {
  const admin = await Admin.findById(userId);
  if (!admin) {
    throw new AppError(MESSAGES.ADMIN_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  admin.fullName = payload.fullName.trim();
  admin.phone = (payload.phone || '').trim();
  await admin.save();
  return publicProfile(admin, USER_ROLES.ADMIN);
}

async function changePassword(user, { currentPassword, newPassword }) {
  const Model = user.role === USER_ROLES.ADMIN ? Admin : Member;
  const account = await Model.findById(user.id).select('+password');
  if (!account) {
    throw new AppError(MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  const matches = await comparePassword(currentPassword, account.password);
  if (!matches) {
    throw new AppError(MESSAGES.CURRENT_PASSWORD_INCORRECT, HTTP_STATUS.BAD_REQUEST);
  }
  account.password = await hashPassword(newPassword);
  await account.save();
}

async function forgotPassword(email) {
  const found = await findAccountByEmail(email);
  if (!found || found.account.status !== ACCOUNT_STATUS.ACTIVE) {
    return;
  }
  const reset = createResetToken();
  found.account.resetPasswordTokenHash = reset.hash;
  found.account.resetPasswordExpires = reset.expiresAt;
  await found.account.save();

  const resetUrl = `${env.frontendUrl}/reset-password?token=${reset.token}`;
  try {
    await sendEmail({
      to: found.account.email,
      subject: EMAIL_SUBJECTS.PASSWORD_RESET,
      html: resetTemplate({ fullName: found.account.fullName, resetUrl }),
    });
  } catch (error) {
    logger.error('Password reset email failed', { message: error.message });
  }

  if (!env.isProduction) {
    logger.info('Password reset link issued', { email: found.account.email, resetUrl });
  }
}

async function resetPassword({ token, password }) {
  const tokenHash = hashToken(token);
  const query = {
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  };
  let account = await Admin.findOne(query).select('+resetPasswordTokenHash +resetPasswordExpires');
  if (!account) {
    account = await Member.findOne(query).select('+resetPasswordTokenHash +resetPasswordExpires');
  }
  if (!account) {
    throw new AppError(MESSAGES.INVALID_RESET_TOKEN, HTTP_STATUS.BAD_REQUEST);
  }
  account.password = await hashPassword(password);
  account.resetPasswordTokenHash = undefined;
  account.resetPasswordExpires = undefined;
  await account.save();
}

async function listAdmins() {
  return Admin.find().select('fullName email phone status createdAt').sort({ createdAt: 1 });
}

async function createAdmin(payload) {
  const email = payload.email.trim().toLowerCase();
  const [adminExists, memberExists] = await Promise.all([
    Admin.exists({ email }),
    Member.exists({ email }),
  ]);
  if (adminExists || memberExists) {
    throw new AppError(MESSAGES.EMAIL_EXISTS, HTTP_STATUS.CONFLICT);
  }
  return Admin.create({
    fullName: payload.fullName.trim(),
    email,
    phone: (payload.phone || '').trim(),
    password: await hashPassword(payload.password),
  });
}

async function updateAdmin(id, payload) {
  const admin = await Admin.findById(id);
  if (!admin) {
    throw new AppError(MESSAGES.ADMIN_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const email = payload.email.trim().toLowerCase();
  const [adminExists, memberExists] = await Promise.all([
    Admin.exists({ email, _id: { $ne: admin._id } }),
    Member.exists({ email }),
  ]);
  if (adminExists || memberExists) {
    throw new AppError(MESSAGES.EMAIL_EXISTS, HTTP_STATUS.CONFLICT);
  }

  admin.fullName = payload.fullName.trim();
  admin.email = email;
  admin.phone = (payload.phone || '').trim();
  if (payload.password) {
    admin.password = await hashPassword(payload.password);
  }
  await admin.save();
  return admin;
}

async function deleteAdmin(id, currentUserId) {
  if (id === currentUserId) {
    throw new AppError(MESSAGES.CANNOT_DELETE_SELF, HTTP_STATUS.BAD_REQUEST);
  }
  const count = await Admin.countDocuments();
  if (count <= 1) {
    throw new AppError(MESSAGES.LAST_ADMIN, HTTP_STATUS.BAD_REQUEST);
  }
  const admin = await Admin.findByIdAndDelete(id);
  if (!admin) {
    throw new AppError(MESSAGES.ADMIN_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  return { id };
}

module.exports = {
  login,
  getProfile,
  updateAdminProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  listAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  publicProfile,
};
