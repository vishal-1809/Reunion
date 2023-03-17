const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../models/userSchema');
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to check for valid JWT token
module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        // const token = authHeader.split(' ')[1];
        const token = req.headers["authorization"];
        // try {
        //     const decoded = jwt.verify(token, JWT_SECRET);
        //     req.userId = decoded.id;
        //     next();
        // } catch (error) {
        //     return res.status(401).json({ error: 'Invalid token' });
        // }
        jwt.verify(token, JWT_SECRET, (err, payload) => {
            if (err) return res.sendStatus(403).json({ error: err });
            const { _id } = payload
            User.findById(_id).then(userdata => {
                req.user = userdata
                next()
            });
        });
    } else {
        return res.status(401).json({ error: 'Token missing' });
    }
};