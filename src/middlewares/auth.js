const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { default: mongoose } = require('mongoose');

exports.generateToken = async (user) => {
    return await jwt.sign({_id : user._id.toString()}, process.env.JWT_SECRET_TOKEN, { expiresIn: process.env.JWT_EXPIRATION_TIME });
    // return await jwt.sign({user}, process.env.JWT_SECRET_TOKEN, { expiresIn: '1d' });
}

exports.userAuthorized = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        let user = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        if(req.cookies.token == undefined) {
            throw new Error("Unauthorized Login Required");
        }
        if(token != (req.cookies.token).toString()) {
            throw new Error("You are logged in Another Device!");
        }
        user = await User.findOne({_id: user._id, token: token});
        if(!user) {
            throw new Error("User Not Found!");
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            data:"",
            message: error.message || "Unauthorized",
            status: 401,
        });
    }
}
