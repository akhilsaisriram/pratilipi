const rabbitMQService = require('../config/rabbitmq');

async function processOrderEvent(orderData) {
    console.log('Received Order Event:', orderData);

    // Simulate order processing
    console.log(`Processing order: ${orderData.orderId} for user: ${orderData.userId}`);

    console.log('Order processing completed.');
}

async function startConsumer() {
    try {
        console.log('Starting message consumer...');
        await rabbitMQService.consumeMessage('order_events', 'order_created_queue', 'order.created', processOrderEvent);
        console.log('Consumer is listening for order events...');
    } catch (error) {
        console.error('Error starting consumer:', error);
    }
}

module.exports = startConsumer;
