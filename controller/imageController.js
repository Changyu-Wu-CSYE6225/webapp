// Image Controller
const asyncHandler = require('express-async-handler');
const db = require('../database/initDB');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require('dotenv');
const crypto = require('crypto');
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Set up S3 client
const s3 = new S3Client({
    // credentials: {
    //     accessKeyId: 'AKIA6LBY2VQXVEBPIHHR',
    //     secretAccessKey: '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',
    // },
    region: process.env.BUCKET_REGION || 'us-east-1',
});


// Generate file name
const generateRandomFileName = () => crypto.randomBytes(16).toString('hex');


// Get all images
const getAllImages = asyncHandler(async (req, res) => {
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

    res.status(200).json(rows);
});



// Upload an image
const uploadImage = asyncHandler(async (req, res) => {
    const { product_id } = req.params;
    const file = req.file;
    const file_name = generateRandomFileName();

    // Validation
    if (file === undefined) {
        res.status(400);
        throw new Error("File and file_name are required");
    }

    // Store in S3
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

    res.status(201).json(rows);
});



// Get image detail
const getImage = asyncHandler(async (req, res) => {

    res.status(200).json(req.rows);
});



// Delete an image
const deleteImage = asyncHandler(async (req, res) => {
    const { product_id, image_id } = req.params;

    // Delete from S3 Bucket
    const params = {
        Bucket: BUCKET_NAME,
        Key: req.rows[0].file_name,
    };

    await s3.send(new DeleteObjectCommand(params));

    // Delete from database
    await db.images.destroy({ where: { product_id, image_id } });

    res.status(204).json();
});



module.exports = {
    getAllImages,
    uploadImage,
    getImage,
    deleteImage,
};