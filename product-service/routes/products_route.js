const express = require('express');
const router = express.Router();
const productController = require('../controller/product_controller');

router.post('/add', productController.addproduct);

router.get('/all', productController.getAllProducts);

router.get('/filter/:name?/:category?/:minPrice?/:maxPrice?/:rating?', productController.filteredproduct);
router.put('/update/:id', productController.updateproduct);
router.post('/review/:productId', productController.addreview);
router.post('/rate/:productId/:userId', productController.updaterating);

module.exports = router;
