const jwt = require('jsonwebtoken');
const {
JWT_SECRET
  } = process.env;
const authenticateToken = (req, res, next) => {
    console.log('====================================');
    console.log(req.headers);
    console.log('====================================');
    const authHeader = req.headers['authorization'];
    console.log('====================================');
    console.log(authHeader);
    console.log('====================================');
    // const token = authHeader && authHeader.split(' ')[1]; 
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied, token missing!' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token!' });
        }
        req.user = user; 
        next();
    });
};

module.exports = authenticateToken;
