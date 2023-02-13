// Product Controller
const asyncHandler = require('express-async-handler');
const db = require('../database/initDB');


// Get a product
const getProduct = asyncHandler(async (req, res) => {
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
    res.status(200).json(rows);
});



// Create a new product
const createProduct = asyncHandler(async (req, res) => {
    // Get inputs
    const { name, description, sku, manufacturer, quantity } = req.body;

    // Validation
    if (!name || !description || !sku || !manufacturer || !quantity) {
        res.status(400);
        throw new Error("Please add all required fields");
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
    res.status(201).json(rows.toJSON());
});



// Update a Product with Put
const updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    let rows = req.rows;

    // Get inputs
    const { name, description, sku, manufacturer, quantity } = req.body;


    // Validation
    if (!name || !description || !sku || !manufacturer || !quantity) {
        res.status(400);
        throw new Error("Please add all required fields");
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
    res.status(204).json();
});



// Update a Product with Patch
const patchProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    let rows = req.rows;

    // Get inputs
    let { name, description, sku, manufacturer, quantity } = req.body;

    // Validation
    if (!name && !description && !sku && !manufacturer && !quantity) {
        res.status(400);
        throw new Error("Please add at least one field");
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
    res.status(204).json();
});



// Delete a product
const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    // Delete from database
    await db.products.destroy({ where: { id: productId } });

    // Succeed
    res.status(204).json();
});




module.exports = {
    getProduct,
    createProduct,
    updateProduct,
    patchProduct,
    deleteProduct,
};