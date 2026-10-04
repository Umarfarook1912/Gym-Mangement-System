const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { USER_ROLES } = require('../constants');

const router = express.Router();

router.get('/admin', authenticate, authorize(USER_ROLES.ADMIN), dashboardController.getAdminDashboard);
router.get('/member', authenticate, authorize(USER_ROLES.MEMBER), dashboardController.getMemberDashboard);

module.exports = router;
