const RabbitMQService = require("../config/rabbitmq");
const productsearch=require('../controller/recommendation_controller')
async function process(queueName, content) {

  try {
console.log("from the produt to the recommendation ");
productsearch.productsearch(content)
  } catch (error) {
    console.error("Error processing inventory check:", error);
  }
}

async function startproductConsumer() {

  try {
    console.log("Starting recomendation Consumers...");

    const queues = ["product_search"];
    const channel = await RabbitMQService.connect();

    for (const queue of queues) {
      await channel.assertQueue(queue, { durable: true });

      channel.consume(
        queue,
        async (msg) => {
          if (msg) {
            const content = JSON.parse(msg.content.toString());
            process(queue, content);
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

module.exports = startproductConsumer;
