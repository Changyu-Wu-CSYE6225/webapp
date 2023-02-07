const express = require('express');
const { createUser, getUser, updateUser } = require('../controller/userController');
const { protectUser } = require('../middleware/authMiddleware');
const router = express.Router();

// User Router
router.post('/', createUser);
router.get('/:userId', protectUser, getUser);
router.put('/:userId', protectUser, updateUser);


module.exports = router;