const Order = require("../model/order");
const order_validator = require("./validator");
const RabbitMQService = require("../config/rabbitmq"); // Import the RabbitMQ service
exports.getordersbyuser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { nondelivered } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    let query = { userId };
    if (nondelivered === "true") {
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

exports.getorderbyid = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ message: "order ID is required" });
    }
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// exports.createorder = async (req, res) => {
//   try {
//     const errors = order_validator.validator(req.body);

//     if (errors.length > 0) {
//       return res.status(400).json({ errors });
//     }

//     const orderData = req.body;
//     const order = new Order(orderData);

//     order.totalPrice = order.calculateTotalPrice();

//     const savedOrder = await order.save();

//     await rabbitMQService.publishMessage("order_events", "order.created", {
//       order: order,
//       orderId: order._id,
//       userId: order.userId,
//       products: order.products,
//       status: order.status,
//       timestamp: new Date(),
//     });
//     res.status(201).json(savedOrder);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };
async function inventorycheck(order) {
  
    try {
      const channel = await RabbitMQService.connect();

      const queueName = "inventory_check_queue";

      // Ensure queue exists before sending a message
      await channel.assertQueue(queueName, { durable: true });

      const message = {
          orderId: order._id,
          order: order
      };

      // Send message to queue directly
      channel.sendToQueue(
          queueName,
          Buffer.from(JSON.stringify(message)),
          { persistent: true }
      );

      // console.log("Inventory check request sent:", message);
  } catch (error) {
      console.error("Error sending inventory check message:", error);
  }
}

exports.createorder = async (req, res) => {
  try {
    const orderData = req.body;
    const order = new Order(orderData);

    // Calculate total price before validation
    order.totalPrice = order.calculateTotalPrice();

    // Validate after setting totalPrice
    const errors = order_validator.validator(order);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    await order.save();

    await inventorycheck(order);

    res.status(201).json({
      message: "Order received. We will notify you about the status via email.",
      orderId: order._id,
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateorder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ message: "order ID is required" });
    }
    const updates = req.body;
    const errors = order_validator.validateorderupdate(updates);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (updates.products) {
      Object.assign(order, updates);
      order.totalPrice = order.calculateTotalPrice();
    } else {
      Object.assign(order, updates);
    }

    await order.save();

    await inventorycheck(order);

    res.status(201).json({
      message: "updated Order received. We will notify you about the status via email.",
      orderId: order._id,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteorder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ message: "order ID is required" });
    }
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.deleteOne({ _id: orderId });
    await rabbitMQService.publishMessage("order_events", "order.deleted", {
      deleted_order_id: orderId,
      timestamp: new Date(),
    });
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
