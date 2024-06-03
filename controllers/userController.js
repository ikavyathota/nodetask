const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @desc Register a user
// @route POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        res.status(400);
        throw new Error("All fields are mandatory");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role,
        token:null,
    });
    const token = generateToken(user._id); 
    user.token = token;
    
    
    await user.save();
    if (user) {
        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: user.token,
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// @desc Login user
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: user.token,
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

// @desc Get current user
// @route GET /api/users/current
// @access Private
const currentUser = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(404);
        throw new Error("User not found");
    }

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.status(200).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
    });
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

module.exports = { registerUser, loginUser, currentUser };
