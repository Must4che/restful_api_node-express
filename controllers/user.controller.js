//@ts-check
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');

exports.createNewUser = async ( req, res, next ) => {
    try {
        const user  = await User.findOne({ email: req.body.email }).exec();
        if ( !user ) {
            const hash = await bcrypt.hash( req.body.password.toString(), 10 );
            const newUser = new User({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash,
                avatarURL: ''
            });
            await newUser.save();
            res.status(200).json({ message: `User ${req.body.email} has been created.` });
        } else {
            return res.status(409).json({ message: `User with email adress "${req.body.email}" already exists.`});
        }
    } catch( err ) {
        return res.status(500).json({ error: err });
    }
}

exports.userLogin = async ( req, res, next ) => {
    try {
        const user  = await User.findOne({ email: req.body.email }).exec();
        if ( !user ) {
            return res.status(401).json({ message: 'Auth failed.'});
        }
        bcrypt.compare( req.body.password, user.password, ( err, response ) => {
            if ( !response ) {
                return res.status(401).json({ message: 'Auth failed.'});
            }
            if ( response ) {
                const createToken = jwt.sign(
                    {
                        email: user.email,
                        userId: user._id
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

exports.uploadImageById = async ( req, res, next ) => {
    try {
        if ( req.file.path ) {
            const user = await User.findById(req.params.userId).exec();
            if ( user._id == req.userData.userId ) {
                const toBeUpdated = await User.findOneAndUpdate({ _id: req.params.userId }, { avatarURL: req.file.path }).exec();
                res.status(200).json({
                    message: `Updated user with ID: ${req.params.userId}`,
                    updatedUser: toBeUpdated,
                    request: {
                        type: 'GET',
                        url: `http://localhost:1234/users/${req.params.userId}`
                    }
                });
            } else {
                return res.status(401).json({ message: 'Auth failed.'});
            }
        } else {
            return res.status(404).json({ message: 'File not found.'});
        }
    } catch( err ) {
        console.log(err);
        res.status(500).json({ error: err });
    } 
}

exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId).select('email avatarURL _id').exec();
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
    try {
        const user = await User.findById(req.params.userId).exec();
        if ( user._id == req.userData.userId ) {
            const updateOps = {};
            for ( const op of req.body ) {
                updateOps[op.propName] = op.value;
            }
            if ( updateOps.password ) {
                updateOps.password = await bcrypt.hash( updateOps.password.toString(), 10 );
            }
            const toBeUpdated = await User.findOneAndUpdate({ _id: req.params.userId }, { $set: updateOps }).exec();
            res.status(200).json({
                message: `Updated user with ID: ${req.params.userId}`,
                updatedUser: toBeUpdated,
                request: {
                    type: 'GET',
                    url: `http://localhost:1234/users/${req.params.userId}`
                }
            });
        } else {
            return res.status(401).json({ message: 'Auth failed.'});
        }
    } catch( err ) {
        res.status(500).json({ error: err });
    }
}

exports.deleteUserById = async ( req, res, next ) => {
    try {
        await User.deleteOne({ _id: req.params.userId }).exec();
        res.status(200).json({ message: 'User has been deleted.' });
    } catch( err ) {
        res.status(500).json({ error: err });
    }
}