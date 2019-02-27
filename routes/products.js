const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../auth/check-auth');
const ProductController = require('../controllers/product.controller');

// Definition of server storage storage
const serverStorage = multer.diskStorage({
    destination: ( req, file, callback ) => {
        callback( null, './uploads/' );
    },
    filename: ( req, file, callback ) => {
        callback( null, new Date().toISOString() + file.originalname )
    },
});

const ImageFilter = ( req, file, callback ) => {
    if ( file.minetype === 'image/jpeg' || file.minetype === 'image/png' ) {
        callback( null, true );
    } else {
        //reject file
        callback( new Error('Immage format is not supported.'), false );
    }
};

const upload = multer({  //defines destination and properties where and how to upload
    storage: serverStorage,
    limit: {
        fileSize: 1024*1024*5  // sets the max file size limit to 5MB
    },
    fileFilter : ImageFilter
});

// ROUTES
router.get( '/', ProductController.getAllProducts );
router.get( '/:productId', ProductController.getProductById );
router.post( '/', checkAuth, upload.single('productImage'), ProductController.createNewProduct );
router.patch( '/:productId', checkAuth, ProductController.updateProductById );
router.delete( '/:productId', checkAuth, ProductController.deleteProductById );

module.exports = router;