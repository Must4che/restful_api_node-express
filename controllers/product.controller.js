//@ts-check
const mongoose = require('mongoose');
const Product = require('../models/product');

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
    const newProduct = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path });
    try {
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
        res.status(200).json({ error: err });
    }
}

exports.updateProductById = (req, res, next) => {
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
}

exports.deleteProductById = (req, res, next) => {
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
}

try {

} catch( err ) {
    
}