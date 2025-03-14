const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const orderroutes=require("./routes/order_routs")
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logs requests to the console


app.get('/', (req, res) => {
  res.status(200).json({ message: 'hello order' });
});

app.use('/order',orderroutes);
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => console.log(`Users service running on port ${PORT}`));
