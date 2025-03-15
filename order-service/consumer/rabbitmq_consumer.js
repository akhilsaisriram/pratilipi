const RabbitMQService = require('../config/rabbitmq');
const Order = require("../model/order");

async function notification(order) {
  
    try {
      const channel = await RabbitMQService.connect();

      const queueName = "notification_queue";

      // Ensure queue exists before sending a message
      await channel.assertQueue(queueName, { durable: true });

      const message = {
          order: order,
          type:"order_update"
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

async function processInventoryCheck(data) {
    const { message, orderId } = data;

    try {
      console.log('====================================');
      console.log(message);
      console.log('====================================');

      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error(`Order with ID ${orderId} not found`);
      }
      
      if (message === 'ok') {
        order.orderStatus = 'confirmed';
      } else {
        order.orderStatus = 'cancelled';
      }
      
      await order.save();
      
      console.log(`Order ${orderId} status updated to: ${order.orderStatus}`);
      if(order.sendnotification){
        await notification(order)

      }
      return order;
    } catch (error) {
      console.error("Error processing inventory check:", error);
      throw error;
    }
  }
  

async function orderconsumer() {
    try {
        console.log("Starting order  Consumer...");

        const queueName = "inventory_check_queue_from_product_ack";
        const channel = await RabbitMQService.connect();

        await channel.assertQueue(queueName, { durable: true });

        channel.consume(
            queueName,
            (msg) => {
                if (msg) {
                    const content = JSON.parse(msg.content.toString());
                    processInventoryCheck(content);
                    channel.ack(msg); 
                }
            },
            { noAck: false }
        );

        // console.log("Listening for inventory check requests...");
    } catch (error) {
        console.error("Error starting inventory check consumer:", error);
    }
}

module.exports = orderconsumer;
