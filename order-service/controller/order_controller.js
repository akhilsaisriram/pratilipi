const Order = require('../model/order');
const order_validator=require("./validator")
const rabbitMQService = require('../config/rabbitmq'); // Import the RabbitMQ service
exports.getordersbyuser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { nondelivered } = req.query;
    if (!userId) {
        return res.status(400).json({message: 'userId is required' });
      } 

    let query = { userId };
    if (nondelivered === 'true') {
      query.isDelivered = false;
    } else {
      query.isDelivered = true;
    }
    const orders = await Order.find(query).sort({ orderDate: -1 });
    
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports. getorderbyid = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
        return res.status(400).json({message: 'order ID is required' });
      }    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createorder = async (req, res) => {
  try {
    const errors = order_validator.validator(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const orderData = req.body;
    const order = new Order(orderData);
    
    // Calculate total price based on products
    order.totalPrice = order.calculateTotalPrice();
    
    const savedOrder = await order.save();
    await rabbitMQService.publishMessage(
        'order_events',
        'order.created',
        {
          orderId: order._id,
          userId: order.userId,
          products: order.products,
          status: order.status,
          timestamp: new Date()
        }
      );
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateorder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
        return res.status(400).json({message: 'order ID is required' });
      }
    const updates = req.body;
    const errors = order_validator.validateorderupdate(updates);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (updates.products) {
      Object.assign(order, updates);
      order.totalPrice = order.calculateTotalPrice();
    } else {
      Object.assign(order, updates);
    }
    
    const updatedOrder = await order.save();
    
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteorder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
        return res.status(400).json({message: 'order ID is required' });
      }
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    await Order.deleteOne({ _id: orderId });
    
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
