const RabbitMQService = require("../config/rabbitmq");
const inventory_check = require("../controller/product_controller");
async function processInventoryCheck(queueName, content) {

  try {
    if (queueName === "inventory_check_queue") {
        inventory_check.inventory_check(content);

    } else if (queueName === "recommendation_from_order_queue") {
        await inventory_check.getRecommendedProducts(content);
    }
  } catch (error) {
    console.error("Error processing inventory check:", error);
  }
}

async function startInventoryConsumer() {

  try {
    console.log("Starting Message Consumers...");

    const queues = ["inventory_check_queue", "recommendation_from_order_queue"];
    const channel = await RabbitMQService.connect();

    for (const queue of queues) {
      await channel.assertQueue(queue, { durable: true });

      channel.consume(
        queue,
        async (msg) => {
          if (msg) {
            const content = JSON.parse(msg.content.toString());
            processInventoryCheck(queue, content);
            channel.ack(msg); // Acknowledge message after processing
          }
        },
        { noAck: false }
      );

      console.log(`Listening for messages on ${queue}...`);
    }
  } catch (error) {
    console.error("Error starting consumers:", error);
  }
}

module.exports = startInventoryConsumer;
