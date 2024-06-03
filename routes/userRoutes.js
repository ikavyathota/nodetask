const express = require('express');
const { registerUser, loginUser, currentUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/current', authMiddleware, currentUser);

module.exports = router;
