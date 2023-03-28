// Image Controller
const dotenv = require('dotenv');
const asyncHandler = require('express-async-handler');
const db = require('../database/initDB');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const generateRandomFileName = require('../utils/generateFileName');
const logger = require('../logger/configLogger');
const metricsClient = require("../logger/configMetrics");


// Environment variables
const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;

// Set up S3 client
const s3 = new S3Client({
    region: BUCKET_REGION,
});
// const s3 = new S3Client({
//     credentials: {
//         accessKeyId: process.env.ACCESS_KEY,
//         secretAccessKey: process.env.SECRET_ACCESS_KEY,
//     },
//     region: BUCKET_REGION,
// });


// Get all images
const getAllImages = asyncHandler(async (req, res) => {
    metricsClient.increment('endpoint.v1.product.image.getall');        // Count API calls
    logger.info("Getting all images...");

    const { product_id } = req.params;

    // Query from db
    const rows = await db.images.findAll({
        where: { product_id: product_id },
        raw: true,
    });

    if (rows === null) {
        res.status(404);
        throw new Error("Product images not found");
    }

    logger.info("Get images succeed");
    res.status(200).json(rows);

    // Timer
    metricsClient.timing('duration.v1.product.image.getall', new Date() - req.startTime);
});



// Upload an image
const uploadImage = asyncHandler(async (req, res) => {
    metricsClient.increment('endpoint.v1.product.image.post');      // Count API calls
    logger.info("Uploading an image...");

    const { product_id } = req.params;
    const file = req.file;
    const file_name = file.originalname + '#' + generateRandomFileName();       // OriginalName#GeneratedName

    // Validation
    if (file === undefined) {
        res.status(400);
        throw new Error("File is required");
    }

    // File type control
    if (!file.mimetype.startsWith('image/')) {
        res.status(400);
        throw new Error("Please upload an image");
    }

    // Store in S3
    logger.info("Storing an image in S3 bucket...");
    const params = {
        Bucket: BUCKET_NAME,
        Key: file_name,
        Body: file.buffer,
        Metadata: {
            'Content-Type': file.mimetype,
        },
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);

    // Store in MySQL
    logger.info("Storing image info in MySQL");
    await db.images.create({
        product_id,
        file_name,
        s3_bucket_path: `s3://${params.Bucket}/${params.Key}`,
    });

    // Get image info
    const rows = await db.images.findOne({
        where: { file_name },
        raw: true,
    });
    rows.file_name = rows.file_name.split('#')[0];

    logger.info("Upload an image succeed");
    res.status(201).json(rows);

    // Timer
    metricsClient.timing('duration.v1.product.image.post', new Date() - req.startTime);
});



// Get image detail
const getImage = asyncHandler(async (req, res) => {
    metricsClient.increment('endpoint.v1.product.image.get');       // Count API calls

    logger.info("Get an image succeed");
    res.status(200).json(req.rows);

    // Timer
    metricsClient.timing('duration.v1.product.image.get', new Date() - req.startTime);
});



// Delete an image
const deleteImage = asyncHandler(async (req, res) => {
    metricsClient.increment('endpoint.v1.product.image.delete');        // Count API calls
    logger.info("Deleting an image...");

    const { product_id, image_id } = req.params;

    // Delete from S3 Bucket
    logger.info("Deleting an image from S3 bucket...");
    const params = {
        Bucket: BUCKET_NAME,
        Key: req.rows[0].file_name,
    };
    await s3.send(new DeleteObjectCommand(params));

    // Delete from database
    logger.info("Deleting image info from MySQL...");
    await db.images.destroy({ where: { product_id, image_id } });

    logger.info("Delete an image succeed");
    res.status(204).json();

    // Timer
    metricsClient.timing('duration.v1.product.image.delete', new Date() - req.startTime);
});



module.exports = {
    getAllImages,
    uploadImage,
    getImage,
    deleteImage,
};