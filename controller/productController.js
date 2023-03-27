// Product Controller
const dotenv = require('dotenv');
const asyncHandler = require('express-async-handler');
const db = require('../database/initDB');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('../logger/configLogger');
const metricsClient = require("../logger/configMetrics");


// Environment variables
const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;

// Set up S3 client
const s3 = new S3Client({
    region: BUCKET_REGION,
});


// Get a product
const getProduct = asyncHandler(async (req, res) => {
    const startTime = new Date();
    metricsClient.increment('endpoint.v1.product.get');     // Count API calls
    logger.info("Getting product information...");

    const { productId } = req.params;

    // Query from database
    const rows = await db.products.findOne({
        where: { id: productId },
        raw: true,
    });

    if (rows === null) {
        res.status(404);
        throw new Error("Product not found");
    }

    // Succeed
    logger.info("Get product information succeed");
    res.status(200).json(rows);

    // Timer
    const endTime = new Date();
    metricsClient.timing('duration.v1.product.get', endTime - startTime);
});



// Create a new product
const createProduct = asyncHandler(async (req, res) => {
    metricsClient.increment('endpoint.v1.product.post');    // Count API calls
    logger.info("Creating a new product...");

    // Get inputs
    const { name, description, sku, manufacturer, quantity } = req.body;

    // Validation
    if (!name || !description || !sku || !manufacturer || quantity === null) {
        res.status(400);
        throw new Error("Please add all required fields - name, description, sku, manufacturer and quantity");
    }

    // Check sku uniqueness
    let rows = await db.products.findOne({ where: { sku: sku } });
    if (rows !== null) {
        res.status(400);
        throw new Error("SKU exists. Please enter a new one");
    }

    // Check quantity availability
    if (typeof quantity === 'string' || quantity < 0 || quantity > 100 || quantity - Math.floor(quantity) !== 0) {
        res.status(400);
        throw new Error("Quantity must be an Integer in the range [0, 100]");
    }


    // Create product and add to Product table
    const owner_user_id = req.userId;
    rows = await db.products.create({
        name,
        description,
        sku,
        manufacturer,
        quantity,
        owner_user_id,
    });


    // Succeed
    logger.info("Create a new product succeed");
    res.status(201).json(rows.toJSON());

    // Timer
    metricsClient.timing('duration.v1.product.post', new Date() - req.startTime);
});



// Update a Product with Put
const updateProduct = asyncHandler(async (req, res) => {
    metricsClient.increment('endpoint.v1.product.put');     // Count API calls
    logger.info("Updating product information...");

    const { productId } = req.params;
    let rows = req.rows;

    // Get inputs
    const { name, description, sku, manufacturer, quantity } = req.body;


    // Validation
    if (!name || !description || !sku || !manufacturer || quantity === null) {
        res.status(400);
        throw new Error("Please add all required fields - name, description, sku, manufacturer and quantity");
    }

    // Check sku uniqueness
    if (rows[0].sku !== sku) {
        const row = await db.products.findOne({ where: { sku: sku } });
        if (row !== null) {
            res.status(400);
            throw new Error("SKU exists. Please enter a new one");
        }
    }

    // Check quantity availability (No String, [0, 100], No decimal)
    if (typeof quantity === 'string' || quantity < 0 || quantity > 100 || quantity - Math.floor(quantity) !== 0) {
        res.status(400);
        throw new Error("Quantity must be an Integer in the range [0, 100]");
    }


    // Update product info
    rows = await db.products.update(
        { name, description, sku, manufacturer, quantity },
        { where: { id: productId } },
    );


    // Succeed
    logger.info("Update product information succeed");
    res.status(204).json();

    // Timer
    metricsClient.timing('duration.v1.product.put', new Date() - req.startTime);
});



// Update a Product with Patch
const patchProduct = asyncHandler(async (req, res) => {
    metricsClient.increment('endpoint.v1.product.patch');       // Count API calls
    logger.info("Patching product information...");

    const { productId } = req.params;
    let rows = req.rows;

    // Get inputs
    let { name, description, sku, manufacturer, quantity } = req.body;

    // Validation
    if (!name && !description && !sku && !manufacturer && quantity === null) {
        res.status(400);
        throw new Error("Please add at least one field - name, description, sku, manufacturer or quantity");
    }

    // Check sku uniqueness
    if (sku && rows[0].sku !== sku) {
        const row = await db.products.findOne({ where: { sku: sku } });
        if (row !== null) {
            res.status(400);
            throw new Error("SKU exists. Please enter a new one");
        }
    }

    // Check quantity availability
    if (quantity && (typeof quantity === 'string' || quantity < 0 || quantity > 100 || quantity - Math.floor(quantity) !== 0)) {
        res.status(400);
        throw new Error("Quantity must be an Integer in the range [0, 100]");
    }


    // Update product info
    name ||= rows[0].name;
    description ||= rows[0].description;
    sku ||= rows[0].sku;
    manufacturer ||= rows[0].manufacturer;
    quantity ||= rows[0].quantity;

    rows = await db.products.update(
        { name, description, sku, manufacturer, quantity },
        { where: { id: productId } },
    );


    // Succeed
    logger.info("Patch product information succeed");
    res.status(204).json();

    // Timer
    metricsClient.timing('duration.v1.product.patch', new Date() - req.startTime);
});



// Delete a product
const deleteProduct = asyncHandler(async (req, res) => {
    metricsClient.increment('endpoint.v1.product.delete');      // Count API calls
    logger.info("Deleting a product...");

    const { productId } = req.params;

    let rows = await db.images.findAll({
        where: { product_id: productId },
        raw: true,
    });

    logger.info("Deleting product images in S3 bucket...");
    rows.forEach(async element => {
        const { file_name } = element;

        // Delete from S3 Bucket
        const params = {
            Bucket: BUCKET_NAME,
            Key: file_name,
        };
        await s3.send(new DeleteObjectCommand(params));
    });


    // Delete from database
    await db.images.destroy({ where: { product_id: productId } });
    await db.products.destroy({ where: { id: productId } });


    // Succeed
    logger.info("Delete a product succeed");
    res.status(204).json();

    // Timer
    metricsClient.timing('duration.v1.product.delete', new Date() - req.startTime);
});




module.exports = {
    getProduct,
    createProduct,
    updateProduct,
    patchProduct,
    deleteProduct,
};