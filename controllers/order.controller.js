//@ts-check
const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order
            .find()
            .select('product quantity _id')
            .populate('product', 'name price') // without populate there will be only _id populated not the whole product
            .exec();  
        res.status(200).json({
            count: orders.length,
            orders: orders.map( item => {
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
    } catch( err ) {
        res.status(500).json({ error: err });
    }
}

exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order
            .findById(req.params.orderId)
            .populate('product', 'name price')
            .exec();
        if ( !order ) {
            return res.status(404).json({ message: "Order not found." });
        }
        res.status(200).json({
            order: order,
            request: {
                type: 'GET',
                url: 'http://localhost:1234/orders/'
            }
        });
    } catch ( err ) {
        res.status(500).json({ error: err });
    }
}

exports.createOrder = async (req, res, next) => {
    try {
        const product = await Product.findById(req.body.productId);
        if ( !product ) {
            return res.status(404).json({ message: "Product not found." });
        }
        const order = new Order({
            _id: new mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        });
        const response = await order.save();
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
    } catch( err ) {
        res.status(500).json({ error: err });
    }
}

exports.deleteOrderById = async (req, res, next) => {
    try {
        await Order
            .remove({ _id: req.params.orderId })
            .exec();
        res.status(200).json({
            message: `Order with Id: ${req.params.orderId} has been deleted`,
            request: {
                type: 'GET',
                url: 'http://localhost:1234/orders/',
                body: {
                    productId: 'Enter_id_here',
                    quantity: 'Enter_quantity_here'
                }
            }
        });
    } catch( err ) {
        res.status(500).json({ error: err });
    }
}