//@ts-check
const mongoose = require('mongoose');
const Product = require('../models/product.model');

exports.getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find().select('name price _id productImage').exec();
        const response = {
            count: products.length,
            products: products.map( prod => {
                return {
                    name: prod.name,
                    price: prod.price,
                    _id: prod._id,
                    productImage: prod.productImage,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:1234/products/' + prod._id
                    }
                }
            })
        };
        res.status(200).json(response);
    } catch( err ) {
        res.status(500).json({ error: err });
    }
}

exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId).select('name price _id productImage').exec();
        if ( product ) {
            res.status(200).json({
                product: product,
                request: {
                    type: 'GET',
                    url: 'http://localhost:1234/products/' + product._id
                }
            });
        } else {
            res.status(404).json({message: `No valid entry found for id: ${req.params.productId}`});
        }
    } catch( err ) {
        res.status(500).json({ error: err });
    }
}

exports.createNewProduct = async (req, res, next) => {
    try {
        const newProduct = new Product({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            price: req.body.price,
            productImage: req.file.path });
        const product = await newProduct.save();
        res.status(200).json({
            message: 'Created product successfully',
            newProduct: product,
            request: {
                type: 'GET',
                url: 'http://localhost:1234/products/' + product._id
            }
        });
    } catch( err ) {
        res.status(500).json({ error: err });
    }
}

exports.updateProductById = async (req, res, next) => {
    try {
        const updateOps = {};
        for ( const ops of req.body ) {
            updateOps[ops.propName] = ops.value;
        }
        const toBeUpdated = await Product.findOneAndUpdate({ _id: req.params.productId }, { $set: updateOps }).exec();
        res.status(200).json({
            message: `Updated product with ID: ${req.params.productId}`,
            updatedProduct: toBeUpdated,
            request: {
                type: 'GET',
                url: `http://localhost:1234/products/'${req.params.productId}`
            }
        });
    } catch( err ) {
        res.status(500).json({ error: err });
    }
}

exports.deleteProductById = async (req, res, next) => {
    try {
        const toBeDeleted = await Product.deleteOne({ _id: req.params.productId }).exec();
        res.status(200).json({
            message: `Deleted product with ID: ${req.params.productId}`,
            deletedProduct: toBeDeleted,
            request: {
                type: 'POST',
                url: 'http://localhost:1234/products/',
                body: { name: 'Enter_product_name_here', price: 'Enter_product_price_here' }
            }
        });
    } catch( err ) {
        res.status(500).json({error: err});
    }
}