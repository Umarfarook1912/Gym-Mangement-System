const express = require('express');
const memberController = require('../controllers/member.controller');
const attendanceController = require('../controllers/attendance.controller');
const announcementController = require('../controllers/announcement.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { USER_ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate, authorize(USER_ROLES.MEMBER));

router.get('/membership', memberController.getOwnMembership);
router.get('/attendance', memberController.getOwnAttendance);
router.post('/attendance/check-in', attendanceController.checkInSelf);
router.post('/attendance/check-out', attendanceController.checkOutSelf);
router.get('/announcements', announcementController.getAnnouncements);

module.exports = router;
