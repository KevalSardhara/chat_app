const jwt = require('jsonwebtoken');


exports.generateToken = async (user) => {
    return await jwt.sign({...user}, process.env.JWT_SECRET_TOKEN, { expiresIn: '1d' });
}


exports.userAuthorized = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const user = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        console.log(user);
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized',
            status: 401,
        });
    }
}
