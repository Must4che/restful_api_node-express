const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const ProductController = require('../controllers/product.controller');

// Storage definition
const sd = require('../middleware/storage-definition');
const saveFileAs = sd.defineStorage();

// ROUTES
router.get( '/', ProductController.getAllProducts );
router.get( '/:productId', ProductController.getProductById );
router.post( '/', checkAuth, saveFileAs.single('productImage'), ProductController.createNewProduct );
router.patch( '/:productId', checkAuth, ProductController.updateProductById );
router.delete( '/:productId', checkAuth, ProductController.deleteProductById );

module.exports = router;