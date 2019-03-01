//@ts-check
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.createNewUser = async ( req, res, next ) => {
    try {
        const user  = await User.findOne({ email: req.body.email }).exec();
        if ( !user ) {
            bcrypt.hash(req.body.password, 10, async (err, hash) => { // second argument is number of SALT cycles 10=considered safe
                if ( !err ) {
                    const newUser = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
                    const response = await newUser.save();
                    res.status(200).json({ message: `User ${user.email} has been created.` });
                } else {
                    return res.status(500).json({ error: err });
                }
            });
        } else {
            return res.status(409).json({ message: `User with email adress "${req.body.email}" already exists.`});
        }
    } catch( err ) {
        return res.status(500).json({ error: err });
    }
}

exports.userLogin = async ( req, res, next ) => {
    try {
        const user = await User.find({ email: req.body.email }).exec();
        if ( user.length < 1 ) {
            return res.status(401).json({ message: 'Auth failed.'});
        }
        bcrypt.compare( req.body.pasword, user[0].password, ( err, response ) => {
            if ( !response ) {
                return res.status(401).json({ message: 'Auth failed.'});
            }
            if ( response ) {
                const createToken = jwt.sign(
                    {
                        email: user[0].email,
                        userId: user[0]._id
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn: "1h"
                    }
                );
                return res.status(200).json({
                    message: `Auth Successful`,
                    token: createToken
                });
            }
            return res.status(401).json({ message: 'Auth failed.'});
        });
    } catch( err ) {
        res.status(500).json({ error: err });
    }
}

exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.productId).select('email avatarURL _id').exec();
        if ( user ) {
            res.status(200).json({
                user: user,
                request: {
                    type: 'GET',
                    url: 'http://localhost:1234/users/' + user._id
                }
            });
        } else {
            res.status(404).json({message: `No valid entry found for id: ${user._id}`});
        }
    } catch( err ) {
        res.status(500).json({ error: err });
    }
}

exports.updateUserById = async (req, res, next) => {
    const updateOptions = {};
    for ( const op of req.body ) {
        updateOptions[op.propName] = op.value;
    }
    try {
        const user = await User.update({ _id: req.params.userId }, { $set: updateOptions }).exec();
        res.status(200).json({
            message: `Updated user with ID: ${user._id}`,
            user: user,
            request: {
                type: 'GET',
                url: `http://localhost:1234/users/${user._id}`
            }
        });
    } catch( err ) {
        res.status(500).json({ error: err });
    }
}

exports.deleteUserById = async ( req, res, next ) => {
    try {
        await User.remove({ _id: req.params.userId }).exec();
        res.status(200).json({ message: 'User has been deleted.' });
    } catch( err ) {
        res.status(500).json({ error: err });
    }
}