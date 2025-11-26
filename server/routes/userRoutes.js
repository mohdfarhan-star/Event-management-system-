const express = require('express');
const router = express.Router();

const {
    createUser,
    getAllUsers,
    updateUserTimezone,
    getUserById
} = require('../controllers/User');

// User routes
router.post('/create', createUser);
router.get('/all', getAllUsers);
router.get('/:userId', getUserById);
router.put('/timezone', updateUserTimezone);

module.exports = router;
