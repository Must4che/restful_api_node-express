// Node Packages
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//Modules & Models imports
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

// Connect to MongoDB
mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@todcluster-vd6zl.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`,
    { useNewUrlParser: true }
);

// Middleware definition
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads')); // makes folder 'uploads' staticly public and accessible
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// CORS Errors Handler -  now AP can be accessed from SPAs
app.use( (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // * means you are allowing access from all urls ( You can restrict it by adding urls )
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-type, Access, Authorization'
    );
    if ( req.method === 'OPTIONS' ) {
        res.header(
            'Access-Control-Allow-Methods',
            'PUT, POST, PATCH, DELETE, GET'
        );
        return res.status(200).json({});
    }
    next(); // Without this CORS Error Handler will block all communication
});

// Routes responsible for handling requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);

// handles error if the is no handle for requested API
app.use( (req, res, next) => {
    const error = new Error('Not found.');
    error.status = 404;
    next(error);
});
app.use( (error, req, res, next) =>{
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;