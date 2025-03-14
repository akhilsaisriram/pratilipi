const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const generateToken = (user) => {
  console.log(user);

  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });
};

module.exports = { generateToken };
