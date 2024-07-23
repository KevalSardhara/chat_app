const User = require("../models/user");


exports.signup = async (req, res, next) => {
    try {
        let password = req.body.password;
        let user = await User.userSignup(req.body);
        delete req.body.password;
        
        user = new User({
            ...user,
            password,
            role : "user"
        });
        await user.save();

        return res.status(200).send({
            data : {
                user,
            },
            message: "User created successfully",
            status : 200,
        });
    } catch (e) {
        // console.log(e);
        return res.status(200).send({
            data: "",
            message: e.message,
            status : 400,
        });
    }
}

exports.signin = async (req, res, next) => {
    try {
        let {mobile, email, password} = req.body;
        let user = await User.userSignin(req.body);
        delete req.body.password;


        return res.status(200).send({
            data : {
                user,
            },
            message: "success",
            status : 200,
        });
    } catch (e) {
        // console.log(e);
        return res.status(200).send({
            data: "",
            message: e.message,
            status : 400,
        });
    }
}