const express = require('express');
const { sendSuccess } = require('../utils/apiResponse');
const { MESSAGES } = require('../constants');
const authRoutes = require('./auth.routes');
const memberRoutes = require('./member.routes');
const planRoutes = require('./plan.routes');
const attendanceRoutes = require('./attendance.routes');
const announcementRoutes = require('./announcement.routes');
const settingsRoutes = require('./settings.routes');
const dashboardRoutes = require('./dashboard.routes');
const reportRoutes = require('./report.routes');
const memberPortalRoutes = require('./memberPortal.routes');
const settingsController = require('../controllers/settings.controller');

const router = express.Router();

router.get('/health', (_req, res) => {
  sendSuccess(res, { message: MESSAGES.HEALTH_OK, data: { status: 'ok' } });
});

router.get('/gym', settingsController.getPublicSettings);

router.use('/auth', authRoutes);
router.use('/admin/members', memberRoutes);
router.use('/admin/plans', planRoutes);
router.use('/admin/attendance', attendanceRoutes);
router.use('/admin/announcements', announcementRoutes);
router.use('/admin/settings', settingsRoutes);
router.use('/admin/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/member', memberPortalRoutes);

module.exports = router;
