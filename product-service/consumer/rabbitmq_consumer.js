const RabbitMQService = require('../config/rabbitmq');
const inventory_check=require("../controller/product_controller")
async function processInventoryCheck(message) {
 

    try {
        inventory_check.inventory_check(message)



    } catch (error) {
        console.error("Error processing inventory check:", error);
    }
}

async function startInventoryConsumer() {
    try {
        console.log("Starting Inventory Check Consumer...");

        const queueName = "inventory_check_queue";
        const channel = await RabbitMQService.connect();

        // Ensure queue exists
        await channel.assertQueue(queueName, { durable: true });

        // Start consuming messages
        channel.consume(
            queueName,
            (msg) => {
                if (msg) {
                    const content = JSON.parse(msg.content.toString());
                    processInventoryCheck(content);
                    channel.ack(msg); // Acknowledge message after processing
                }
            },
            { noAck: false }
        );

        // console.log("Listening for inventory check requests...");
    } catch (error) {
        console.error("Error starting inventory check consumer:", error);
    }
}

module.exports = startInventoryConsumer;
