const express = require('express');
const router = express.Router();

const checkAuth = require('../auth/check-auth');
const UserController = require('../controllers/user.controller');

// ROUTES
router.post( '/signup', UserController.createNewUser );
router.post( '/login', UserController.userLogin );
router.delete( '/:userId', checkAuth, UserController.deleteUserById );
// TODO: implement updateUserById via .patch()

module.exports = router;