const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const notificationRoutes=require("./routes/notification_route");
const startConsumer = require('./controller/rabbitmq_consumer'); 

app.use(cors());
app.use(express.json());
app.use(morgan('dev')); 
const rabbitMQService = require('./config/rabbitmq'); // Import the RabbitMQ service

const connectdb = require('./config/db');
connectdb();
app.get('/', (req, res) => {
  res.status(200).json({ message: 'hello' });
});

app.use('/notifications', notificationRoutes);

async function initializeApp() {
  try {
    // Connect to RabbitMQ
    await rabbitMQService.connect();
    console.log('RabbitMQ service initialized successfully in notification');
    await startConsumer(); 

    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      await rabbitMQService.closeConnection();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

initializeApp();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Users service running on port ${PORT}`));
