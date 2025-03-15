const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notification-controller'); // Adjust path as needed

router.get('/:userId', notificationController.getusernotification);

router.get('/:userId/unread', notificationController.get_unread_notifications);

router.get('/read/:userId/:notificationId', notificationController.mark_notifications_asread);

// router.post('/create', notificationController.create_notification);

module.exports = router;
