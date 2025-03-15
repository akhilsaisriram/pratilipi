const RabbitMQService = require("../config/rabbitmq");
const create_notification =require("../controller/notification-controller")

function generateNotification(order) {
  const productDetails = order.products.map(p => 
    `${p.name} (${p.quantity} x ₹${p.price})`).join(", ");
  
  switch (order.orderStatus) {
    case 'pending':
      return `Your order #${order._id.toString().slice(-6)} is pending. Items: ${productDetails}. Total: ₹${order.totalPrice}. We'll notify you once it's confirmed.`;
      
    case 'confirmed':
      return `Your order #${order._id.toString().slice(-6)} has been confirmed! Items: ${productDetails}. Expected delivery by ${new Date(order.estimatedDelivery).toLocaleDateString()}. Payment status: ${order.isPaid ? 'Paid' : 'Pending'}.`;
      
    case 'shipped':
      return `Great news! Your order #${order._id.toString().slice(-6)} containing ${order.products.length} item(s) (${productDetails}) has been shipped. Expected delivery by ${new Date(order.estimatedDelivery).toLocaleDateString()}.`;
      
    case 'delivered':
      return `Your order #${order._id.toString().slice(-6)} has been delivered on ${new Date(order.deliveryDate).toLocaleDateString()}. We hope you enjoy your ${order.products.length > 1 ? 'items' : 'item'}: ${productDetails}.`;
      
    case 'cancelled':
      return `Your order #${order._id.toString().slice(-6)} containing ${productDetails} has been cancelled. ${order.isPaid ? 'A refund of ₹' + order.totalPrice + ' will be processed shortly.' : ''}`;
      
    default:
      return `Update on your order #${order._id.toString().slice(-6)}: ${productDetails}. Total: ₹${order.totalPrice}.`;
  }
}

async function processnotification(notify) {
  console.log("Received Order Event:", notify);
  const {order,type}=notify;
  const content=generateNotification(order);

  create_notification.create_notification(content,order.userId,type)


}

async function startConsumer() {
  try {
    const queueName = "notification_queue";
    const channel = await RabbitMQService.connect();

    await channel.assertQueue(queueName, { durable: true });

    channel.consume(
      queueName,
      (msg) => {
        if (msg) {
          const content = JSON.parse(msg.content.toString());
          processnotification(content);
          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Error starting consumer:", error);
  }
}

module.exports = startConsumer;
