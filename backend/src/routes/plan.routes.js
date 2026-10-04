const express = require('express');
const planController = require('../controllers/plan.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { planSchema } = require('../validations/plan.validation');
const { USER_ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN));

router.get('/', planController.getPlans);
router.post('/reminders', planController.sendExpiryReminders);
router.post('/', validate(planSchema), planController.createPlan);
router.patch('/:id', validate(planSchema), planController.updatePlan);
router.delete('/:id', planController.deletePlan);

module.exports = router;
