const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  loginSchema,
  forgotSchema,
  resetSchema,
  changePasswordSchema,
  adminProfileSchema,
  createAdminSchema,
  updateAdminSchema,
} = require('../validations/auth.validation');
const { USER_ROLES, TIME, MESSAGES } = require('../constants');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: TIME.RATE_LIMIT_WINDOW_MS,
  max: TIME.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: MESSAGES.TOO_MANY_REQUESTS, error: null },
});

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/forgot-password', authLimiter, validate(forgotSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetSchema), authController.resetPassword);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, authorize(USER_ROLES.ADMIN), validate(adminProfileSchema), authController.updateProfile);

router.get('/admins', authenticate, authorize(USER_ROLES.ADMIN), authController.listAdmins);
router.post('/admins', authenticate, authorize(USER_ROLES.ADMIN), validate(createAdminSchema), authController.createAdmin);
router.patch('/admins/:id', authenticate, authorize(USER_ROLES.ADMIN), validate(updateAdminSchema), authController.updateAdmin);
router.delete('/admins/:id', authenticate, authorize(USER_ROLES.ADMIN), authController.deleteAdmin);

module.exports = router;
