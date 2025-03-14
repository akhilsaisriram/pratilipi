const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const notificationRoutes=require("./routes/notification_route");
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); 

app.get('/', (req, res) => {
  res.status(200).json({ message: 'hello' });
});

app.use('/notifications', notificationRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Users service running on port ${PORT}`));
