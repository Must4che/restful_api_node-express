const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');
const UserController = require('../controllers/user.controller');

// Storage definition
const sd = require('../middleware/storage-definition');
const storageDefinition = sd.defineStorage( './uploads/' );

// ROUTES
router.post( '/signup', storageDefinition.single('avatarURL'), UserController.createNewUser );
router.post( '/login', UserController.userLogin );
router.get( '/:userId', checkAuth, UserController.getUserById );
router.patch( '/:userId', checkAuth, UserController.updateUserById );
router.delete( '/:userId', checkAuth, UserController.deleteUserById );

module.exports = router;