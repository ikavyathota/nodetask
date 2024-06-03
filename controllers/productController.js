const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const User = require("../models/userModel");


// @desc    Create a new product
// @route   POST /api/products
// @access  Admin 


const createProduct = asyncHandler(async (req, res) => {
    const { title, description, inventoryCount } = req.body;
    if (!title || !description || !inventoryCount) {
        res.status(400).json({ error: "Please fill all fields" });
        return;
    }

    try {
        const bearerToken = req.headers.authorization;
        if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
            res.status(401).json({ error: "Authorization token missing or invalid" });
            return;
        }

        const token = bearerToken.split(' ')[1];
        console.log('Extracted Token:', token);

        const user = await User.findOne({ token });
        console.log('User:', user.username);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        if (user.role !== 'admin') {
            res.status(403).json({ errorMessage: `${user.username} with ${user.role} role not authorized to create products` });
            return;
        }

        const product = await Product.create({
            title,
            description,
            inventoryCount
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// @desc    Get all products
// @route   GET /api/products
// @access  Admin/Manager
const getProducts = asyncHandler(async (req, res) => {

        const bearerToken = req.headers.authorization;
        if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
            res.status(401).json({ error: "Authorization token missing or invalid" });
            return;
        }

        const token = bearerToken.split(' ')[1];
        console.log('Extracted Token:', token);

        const user = await User.findOne({ token });
        console.log('User:', user.username);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }


        if (user.role !== 'admin' && user.role !== 'manager') {
            res.status(403);
            throw new Error(`${user.username} with ${user.role} role not authorized to view products`);
        }

        const products = await Product.find();
        res.status(200).json(products);
    
});

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Admin/Manager
const getProduct = asyncHandler(async (req, res) => {
    const bearerToken = req.headers.authorization;
    
        if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
            res.status(401).json({ error: "Authorization token missing or invalid" });
            return;
        }

        const token = bearerToken.split(' ')[1];
        console.log('Extracted Token:', token);

        const user = await User.findOne({ token });
        console.log('User:', user.username);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (user.role !== 'admin' && user.role !== 'manager') {
            res.status(403);
            throw new Error(`${user.username} with ${user.role} role not authorized to view product`);
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        res.status(200).json(product);
    
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Admin/Manager
const updateProduct = asyncHandler(async (req, res) => {
    
        const bearerToken = req.headers.authorization;
        if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
            res.status(401).json({ error: "Authorization token missing or invalid" });
            return;
        }

        const token = bearerToken.split(' ')[1];
        console.log('Extracted Token:', token);

        const user = await User.findOne({ token });
        console.log('User:', user.username);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }


        if (user.role !== 'admin' && user.role !== 'manager') {
            res.status(403).json({ errorMessage: `${user.username} with ${user.role} role not authorized to update product` });
            return;
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        const { title, description, inventoryCount } = req.body;

        product.title = title || product.title;
        product.description = description || product.description;
        product.inventoryCount = inventoryCount || product.inventoryCount;

        const updatedProduct = await product.save();

        res.status(200).json(updatedProduct);
   
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Admin

const deleteProduct = asyncHandler(async (req, res) => {
    
        const bearerToken = req.headers.authorization;

        if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
            res.status(401).json({ error: "Authorization token missing or invalid" });
            return;
        }

        const token = bearerToken.split(' ')[1];
        console.log('Extracted Token:', token);

        const user = await User.findOne({ token });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        if (user.role !== 'admin') {
            res.status(403).json({ errorMessage: `${user.username} with ${user.role} role not authorized to delete product` });
            return;
        }

        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }

        res.status(200).json({ message: "Product deleted successfully" });
    
});

module.exports = { createProduct, getProducts, getProduct, updateProduct, deleteProduct };
