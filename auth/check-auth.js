const jwt = require('jsonwebtoken');

module.exports = ( req, res, next ) => {
    try {
        const token = req.header.authorization.spilt(' ')[1];
        const decoded = jwt.verify( token, process.env.JWT_KEY );
        req.userData = decoded;
        next();
    } catch ( err ) {
        return res.status(401).json({ message: 'Auth failed.' });
    }
    const decoded = jwt.verify( req.body.token, process.env.JWT_KEY );
};