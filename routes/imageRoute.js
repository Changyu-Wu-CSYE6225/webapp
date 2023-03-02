const express = require('express');
const { getAllImages, uploadImage, getImage, deleteImage } = require('../controller/imageController');
const { protectProductImage } = require('../middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');

// Handle file uploading with Multer memoryStorage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Image
router.get('/:product_id/image', protectProductImage, getAllImages);
router.post('/:product_id/image', protectProductImage, upload.single('file'), uploadImage);
router.get('/:product_id/image/:image_id', protectProductImage, getImage);
router.delete('/:product_id/image/:image_id', protectProductImage, deleteImage);

module.exports = router;