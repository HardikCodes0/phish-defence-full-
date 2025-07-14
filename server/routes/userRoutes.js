const express = require('express');
const router = express.Router(); // ✅ <-- fixed
const protect = require('../middleware/authmiddleware');

const { registeruser, getUserById, changePassword, deleteUser } = require('../controllers/userController'); // ✅ use camelCase if your function is named that way

router.post('/register', registeruser); // ✅ match function name exactly
router.get('/:id', getUserById);
router.put('/changepassword', protect, changePassword);
router.delete('/:id', protect, deleteUser);

module.exports = router;
