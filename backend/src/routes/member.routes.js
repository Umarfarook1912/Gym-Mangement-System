const express = require('express');
const memberController = require('../controllers/member.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { memberSchema, paymentSchema } = require('../validations/member.validation');
const { USER_ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN));

router.get('/', memberController.getMembers);
router.post('/', validate(memberSchema), memberController.createMember);
router.get('/:id', memberController.getMember);
router.patch('/:id', validate(memberSchema), memberController.updateMember);
router.post('/:id/payments', validate(paymentSchema), memberController.recordPayment);
router.delete('/:id', memberController.deleteMember);
router.get('/:id/attendance', memberController.getMemberAttendance);

module.exports = router;
