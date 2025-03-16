const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const RabbitMQService = require("./config/rabbitmq");
const orderbyuser=require('./controller/recommendation_controller');
const connectdb = require('./config/db');
const startproductConsumer=require('./consumer/rabbitmq_consumer')
connectdb();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({ message: "hello" });
});

async function initializeApp() {
  try {
    // Connect to RabbitMQ
    await RabbitMQService.connect();
    console.log("RabbitMQ service initialized successfully recommadation");

    await RabbitMQService.consumeMessage(
      "order_exchange",
      "recommendation_queue",
      "inventory.check",
      async (message) => {
        console.log("Recommendation triggered by order");

        try {
          // const { orderId, order } = message;
          // const { products, totalPrice } = order;
          orderbyuser.orderbyuser(message);
     
        } catch (error) {
          console.error("Error processing inventory check:", error);
        }
      }
    );
    await startproductConsumer()
    process.on("SIGINT", async () => {
      console.log("Shutting down...");
      await RabbitMQService.closeConnection();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  }
}
initializeApp();

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => console.log(`Users service running on port ${PORT}`));
