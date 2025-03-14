const express = require('express');
const cors = require('cors');
const connectdb = require('./config/db');
const morgan = require('morgan');
const app = express();
const user_route=require('./routes/usersroute')
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logs requests to the console
connectdb();

app.use('/users', user_route);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'hello' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Users service running on port ${PORT}`));
