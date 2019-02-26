const express = require('express');
const router = express.Router();
// const { Router } = require('express');
const Product = require('../models/product');
const mongoose = require('mongoose');

router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id')
        .exec()
        .then( dbResponse => {
            const response = {
                count: dbResponse.length,
                products: dbResponse.map( doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
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

router.post('/', (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
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
        .select('name price _id')
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

router.patch('/:productId', (req, res, next) => {
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

router.delete('/:productId', (req, res, next) => {
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