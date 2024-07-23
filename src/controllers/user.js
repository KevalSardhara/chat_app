const User = require("../models/user");
const authentication = require("../middlewares/auth");

exports.signup = async (req, res, next) => {
    try {
        let password = req.body.password;
        let user = await User.userSignup(req.body);
        delete req.body.password;

        user = new User({
            ...user,
            password,
            role: "user"
        });
        await user.save();

        return res.status(200).send({
            data: {
                user,
            },
            message: "User created successfully",
            status: 200,
        });
    } catch (e) {
        // console.log(e);
        return res.status(200).send({
            data: "",
            message: e.message,
            status: 400,
        });
    }
}

exports.signin = async (req, res, next) => {
    try {
        let { mobile, email, password } = req.body;
        delete req.body.password;
        if(!password || password == undefined || password == "") {
            throw new Error("Password is required");
        }
        let search = {
            $or: [
                { email: email },
                { mobile: mobile }
            ]
        };
        let user = await User.findOne(search, {__v : 0}).lean();
        if(!user) {
            throw new Error("Something went wrong. Please try again later");
        }
        const isValid = await user.userSignin(password);
        if(!isValid) {
            throw new Error("Email or Password Wrong!, Please try Again");
        }
        let token = await authentication.generateToken(user);
        user.token = token;
        user.save();

        res.cookie("token", token, {
            path: "/", // Cookie is accessible from all paths
            expires: new Date(Date.now() + 86400000), // Cookie expires in 1 day
            secure: true, // Cookie will only be sent over HTTPS
            httpOnly: true, // Cookie cannot be accessed via client-side scripts
            sameSite: "None",
          });

        return res.status(200).send({
            data : {
                user,
                isValid,
            },
            message: "success",
            status: 200,
        });
    } catch (e) {
        // console.log(e);
        return res.status(200).send({
            data: "",
            message: e.message,
            status: 400,
        });
    }
}


exports.dashboard = async (req, res, next) => {
    try {
        let user = req.user;
        return res.status(200).send({
            data: {
                user,
            },
            message: "User created successfully",
            status: 200,
        });
    } catch (e) {
        // console.log(e);
        return res.status(200).send({
            data: "",
            message: e.message,
            status: 400,
        });
    }
}
