const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../auth/check-auth');

// 
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
router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id productImage')
        .exec()
        .then( dbResponse => {
            const response = {
                count: dbResponse.length,
                products: dbResponse.map( doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        productImage: doc.productImage,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:1234/products/' + doc._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch( err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product.save()
        .then( response => {
            res.status(200).json({
                message: 'Created product successfully',
                createdProduct: {
                    name: response.name,
                    price: response.price,
                    _id: response._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:1234/products/' + response._id
                    }
                }
            });
        })
        .catch( err => {
            console.log(err);
            res.status(200).json({ error: err });
        });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then( response => {
            if ( response ) {
                res.status(200).json({
                    product: response,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:1234/products/' + response._id
                    }
                });
            } else {
                res.status(404).json({message: `No valid entry found for id: ${id}`});
            }
        })
        .catch( err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.patch('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for ( const ops of req.body ) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then( response => {
            console.log(response);
            res.status(200).json({
                message: `Updated product with ID: ${id}`,
                request: {
                    type: 'GET',
                    url: 'http://localhost:1234/products/' + id
                }
            });
        })
        .catch( err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId
    Product.remove({ _id: id })
        .exec()
        .then( response => {
            console.log(response);
            res.status(200).json({
                message: `Deleted product with ID: ${id}`,
                request: {
                    type: 'POST',
                    url: 'http://localhost:1234/products/',
                    body: { name: 'Enter_product_name_here', price: 'Enter_product_price_here' }
                }
            });
        })
        .catch( err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

module.exports = router;