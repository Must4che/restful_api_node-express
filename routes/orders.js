const express = require('express');
const router = express.Router();
const checkAuth = require('../auth/check-auth');
const OrderController = require('../controllers/order.controller');

// ROUTES
router.get( '/', checkAuth, OrderController.getAllOrders );
router.post( '/', checkAuth, OrderController.createOrder );
router.get( '/:orderId', checkAuth, OrderController.getOrderById );
router.delete( '/:orderId', checkAuth, OrderController.deleteOrderById );

module.exports = router;