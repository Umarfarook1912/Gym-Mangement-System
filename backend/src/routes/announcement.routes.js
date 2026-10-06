const express = require('express');
const announcementController = require('../controllers/announcement.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { announcementSchema } = require('../validations/announcement.validation');
const { USER_ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN));

router.get('/', announcementController.getAnnouncements);
router.post('/', validate(announcementSchema), announcementController.createAnnouncement);
router.patch('/:id', validate(announcementSchema), announcementController.updateAnnouncement);
router.post('/:id', validate(announcementSchema), announcementController.updateAnnouncement);
router.delete('/:id', announcementController.deleteAnnouncement);

module.exports = router;
