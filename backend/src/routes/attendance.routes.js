const express = require('express');
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { checkSchema, attendanceQuerySchema, manualAttendanceSchema, updateAttendanceSchema } = require('../validations/attendance.validation');
const { USER_ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN));

router.post('/check-in', validate(checkSchema), attendanceController.checkIn);
router.post('/manual', validate(manualAttendanceSchema), attendanceController.recordManual);
router.post('/check-out', validate(checkSchema), attendanceController.checkOut);
router.get('/today', attendanceController.getToday);
router.get('/calendar', validate(attendanceQuerySchema), attendanceController.getCalendar);
router.get('/monthly', validate(attendanceQuerySchema), attendanceController.getMonthly);
router.get('/', validate(attendanceQuerySchema), attendanceController.getByDate);
router.patch('/:id', validate(updateAttendanceSchema), attendanceController.updateAttendance);
router.delete('/:id', attendanceController.deleteAttendance);

module.exports = router;
