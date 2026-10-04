const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { verifyAuthToken } = require('../utils/token');
const Admin = require('../models/admin.model');
const Member = require('../models/member.model');
const { USER_ROLES, ACCOUNT_STATUS, HTTP_STATUS, MESSAGES } = require('../constants');

const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    throw new AppError(MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  const payload = verifyAuthToken(token);
  const Model = payload.role === USER_ROLES.ADMIN ? Admin : Member;
  const account = await Model.findById(payload.id);

  if (!account || account.status !== ACCOUNT_STATUS.ACTIVE) {
    throw new AppError(MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  req.user = {
    id: account.id,
    role: payload.role,
    email: account.email,
    fullName: account.fullName,
  };
  next();
});

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError(MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
      return;
    }
    next();
  };
}

module.exports = { authenticate, authorize };
