const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup', ( req, res, next ) => {
    User.find({ email: req.body.email })  // static method find() returns empty array instead of null if nothing is found
        .then( user => {
            if ( user.length >= 1 ) {
                return res.status(409).json({ message: `User with email adress "${user.email}" already exists.`});
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => { // second argument is number of SALT cycles 10=considered safe
                    if ( err ) {
                        return res.status(500).json({ error: err });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user.save()
                            .then( response => {
                                res.status(200).json({ message: `User ${user.email} has been created.` });
                            })
                            .catch( err => {
                                res.status(500).json({ error: err });
                            });
                    }
                });
            }
        });
});

router.post('/login', ( req, res, next ) => {
    User.find({ email: req.body.email })
        .exec()
        .then( user => {  // returns array of user
            if ( user.length < 1 ) {
                return res.status(401).json({ message: 'Auth failed.'});
            }
            bcrypt.compare( req.body.pasword, user[0].password, ( err, response ) => {
                if ( response ) {
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
        })
        .catch( err => {
            res.status(500).json({ error: err });
        });
});

router.delete('/:userId', ( req, res, next ) => {
    User.remove({ _id: req.params.userId })
        .exec()
        .then( response => {
            res.status(200).json({ message: 'User has been deleted.' });
        })
        .catch( err => {
            res.status(500).json({ error: err });
        });
});

module.exports = router;