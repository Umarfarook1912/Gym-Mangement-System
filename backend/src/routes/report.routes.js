const express = require('express');
const reportController = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { reportQuerySchema } = require('../validations/report.validation');
const { USER_ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN));
router.get('/export', validate(reportQuerySchema), reportController.exportReport);
router.get('/', validate(reportQuerySchema), reportController.getReport);

module.exports = router;
