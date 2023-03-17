const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../models/userSchema');

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
    const { authorization } = req.headers
    console.log('auth', authorization);
    //authorization === Bearer ewefwegwrherhe
    if (!authorization) {
        return res.status(401).json({ error: "you must be logged in" })
    }
    const token = authorization.replace("Bearer ", "")
    console.log('token', token);
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(401).json({ error: err })
        }

        const { id, iat, exp } = payload;
        User.findById(id).then(userdata => {
            req.user = userdata
            next()
        })
        // const decoded = jwt.verify(token, JWT_SECRET);
        //     req.userId = decoded.id;
        //     next();
    })
}