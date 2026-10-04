const express = require('express');
const settingsController = require('../controllers/settings.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { settingsSchema } = require('../validations/settings.validation');
const { USER_ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN));
router.get('/', settingsController.getSettings);
router.put('/', validate(settingsSchema), settingsController.updateSettings);

module.exports = router;
