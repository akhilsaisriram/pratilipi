const Notification = require("../model/notification"); // Adjust path as needed

exports.getusernotification = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ userId }).sort({
      sentAt: -1,
    }); 

    res.status(200).json({
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

exports.get_unread_notifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const unreadNotifications = await Notification.find({
      userId,
      read: false,
    }).sort({ sentAt: -1 });

    if (unreadNotifications.length > 0) {
      const notificationIds = unreadNotifications.map(
        (notification) => notification._id
      );
      await Notification.updateMany(
        {
          _id: { $in: notificationIds },
        },
        { read: true }
      );
    }
    res.status(200).json({
      count: unreadNotifications.length,
      data: unreadNotifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching unread notifications",
      error: error.message,
    });
  }
};

exports.mark_notifications_asread = async (req, res) => {
    try {
      const { userId } = req.params;
      const { notificationId } = req.params; 
      
      if (notificationId) {
        const notification = await Notification.findOneAndUpdate(
          { _id: notificationId, userId }, 
          { read: true },
          { new: true }
        );
        
        if (!notification) {
          return res.status(404).json({
            success: false,
            message: "Notification not found or doesn't belong to this user"
          });
        }
        
        return res.status(200).json({
          success: true,
          message: "Notification marked as read",
          data: notification
        });
      } 
      else {
        const result = await Notification.updateMany(
          { userId, read: false },
          { read: true }
        );
        
        return res.status(200).json({
          success: true,
          message: `${result.modifiedCount} notifications marked as read`,
          modifiedCount: result.modifiedCount
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error marking notifications as read",
        error: error.message
      });
    }
  };
  
exports.create_notification = async (req, res) => {
  try {
    const { userId, type, content } = req.body;
    if (!userId) {
        return res.status(400).json({message: 'User ID is required' });
      }
      if (!['promotion', 'order_update', 'recommendation'].includes(type)) {
        return res.status(400).json({message: 'Invalid notification type' });
      }
      if (typeof content !== 'string' || content.length <= 5) {
        return res.status(400).json({  message: 'Content length must be grater than 5 character' });
      }
    const notification = await Notification.create({
      userId,
      type,
      content,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating notification",
      error: error.message,
    });
  }
};
