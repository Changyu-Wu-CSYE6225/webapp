const express = require('express');
const { createProduct, updateProduct, patchProduct, deleteProduct, getProduct } = require('../controller/productController');
const { protectProduct } = require('../middleware/authMiddleware');
const router = express.Router();


// Product router (authenticated)
router.get('/:productId', getProduct);
router.post('/', protectProduct, createProduct);
router.put('/:productId', protectProduct, updateProduct);
router.patch('/:productId', protectProduct, patchProduct);
router.delete('/:productId', protectProduct, deleteProduct);


module.exports = router;