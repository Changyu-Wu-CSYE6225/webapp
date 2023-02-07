const express = require('express');
const { createUser, getUser, updateUser } = require('../controller/userController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

// User Router
router.post('/', createUser);
router.get('/:userId', protect, getUser);
router.put('/:userId', protect, updateUser);


module.exports = router;