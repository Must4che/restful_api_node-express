const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .populate('product', 'name price') // without populate there will be only _id populated not the whole product
        .exec()
        .then( response => {
            res.status(200).json({
                count: response.length,
                orders: response.map( item => {
                    return {
                        _id: item._id,
                        product: item.product,
                        quantity: item.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:1234/orders/' + item._id
                        }
                    }
                })
            });
        })
        .catch( err => {
            res.status(500).json({ error: err });
        });
});

router.post('/', (req, res, next) => {
    Product.findById(req.body.productId)
        .then( product => {
            if ( !product ) {
                return res.status(404).json({ message: "Product not found." });
            } 
            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            return order.save(); 
        })
        .then( response =>{
            console.log(response);
            res.status(201).json({
                message: `Order created with Id: ${response._id}`,
                createdOrder: {
                    _id: response._id,
                    product: response.product,
                    quantity: response.quantity
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:1234/orders/' + response._id
                }
            });
        })
        .catch( err => {
            res.status(500).json({ error: err });
    });     
});

router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId)
        .populate('product', 'name price')
        .exec()
        .then( order => {
            if ( !product ) {
                return res.status(404).json({ message: "Order not found." });
            }
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'http://localhost:1234/orders/'
                }
            });
        })
        .catch( err => {
            res.status(500).json({ error: err });
        });
});

router.delete('/:orderId', (req, res, next) => {
    Order.remove({ _id: req.params.orderId })
        .exec()
        .then( response => {
            res.status(200).json({
                message: `Order with Id: ${response._id} has been deleted`,
                request: {
                    type: 'GET',
                    url: 'http://localhost:1234/orders/',
                    body: {
                        productId: 'Enter_id_here',
                        quantity: 'Enter_quantity_here'
                    }
                }
            });
        })
        .catch( err => {
            res.status(500).json({ error: err });
        });
});

module.exports = router;