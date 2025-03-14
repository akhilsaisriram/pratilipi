const express = require('express');
const cors = require('cors');
const connectdb = require('./config/db');
const morgan = require('morgan');
const app = express();
const product_route=require('./routes/products_route')
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logs requests to the console
connectdb();

app.use('/product', product_route);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'hello products' });
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => console.log(`Users service running on port ${PORT}`));
