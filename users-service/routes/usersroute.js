const express = require("express");
const router = express.Router();
const userController = require("../controller/usercontroller");
const authenticateToken =require("../middlewares/authMiddleware")
router.post("/register", userController.registeruser);
router.post("/login", userController.login);

router.delete('/:id',authenticateToken, userController.deleteuser);

router.get('/',authenticateToken, userController.getuser);

router.put('/',authenticateToken, userController.updateuser);

router.patch('/change-password',authenticateToken, userController.changepassword);

module.exports = router;
