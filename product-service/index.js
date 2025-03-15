const express = require('express');
const cors = require('cors');
const connectdb = require('./config/db');
const morgan = require('morgan');
const app = express();
const product_route=require('./routes/products_route')
const startInventoryConsumer = require('./consumer/rabbitmq_consumer'); 
const RabbitMQService = require('./config/rabbitmq'); 

app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logs requests to the console
connectdb();

app.use('/product', product_route);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'hello products' });
});
async function initializeApp() {
  try {
    // Connect to RabbitMQ
    await RabbitMQService.connect();
    console.log('RabbitMQ service initialized successfully product');

    await startInventoryConsumer(); 


    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      await RabbitMQService.closeConnection();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

initializeApp();
const PORT = process.env.PORT || 3003;

app.listen(PORT, () => console.log(`Users service running on port ${PORT}`));
