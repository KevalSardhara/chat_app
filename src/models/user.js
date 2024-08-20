const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        default: "",
        required: [false, "Email is required."],
    },
    mobile: {
        type: String,
        required: false,
        default: "",
    },
    profile: {
        type: String,
        default: "",
        required: false
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_online: {
        type: Boolean,
        required: false
    },
    is_active: {
        type: Boolean,
        required: false
    },
    token: {
        type: String,
        default: "",
        required: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
        required: true,
    },
    role: {
        type: String,
        required: true
    },
    socket_id: {
        type: String,
        default: "",
    }
},
    {
        timestamps: true
    }
);



userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    userObject.email = (userObject.email != undefined && userObject.email) ? userObject.email : "";
    userObject.mobile = (userObject.mobile != undefined && userObject.mobile) ? userObject.mobile : "";

    delete userObject.password;
    delete userObject.token;
    return userObject;
}


userSchema.statics.userSignup = async function (userData) {
    let user;
    let { username, email, mobile, profile, token, password } = userData;
    if ((!username || username == undefined && username == "") || !(email || mobile) || !password || password == undefined || password == "") {
        throw new Error("Please provide all the required fields");
    }

    // Check if email or mobile already exists
    let checkIsExists = {
        $or: [
            { email: email },
            { mobile: mobile }
        ]
    };
    user = await User.findOne(checkIsExists);
    if (user) {
        throw new Error("User already exists. Please use Different Email or Mobile");
    }
    let userObject = {};
    userObject.email = (email != undefined && email) ? email : "";
    userObject.mobile = (mobile != undefined && mobile) ? mobile : "";
    userObject.username = (username != undefined && username) ? username : "";
    userObject.token = (token != undefined && token) ? token : "";
    userObject.profile = (profile != undefined && profile) ? profile : "";

    return userObject;
}



userSchema.methods.userSignin = async function (userPassword) {
    let user = this;
    let isValid = await bcrypt.compare(userPassword, user.password); // true
    return isValid;
}


// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this;
    const SALT_ROUNDS = 10;
    // console.log(user.isModified('password'))
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, SALT_ROUNDS)
    }
    next();
})

const User = mongoose.model("User", userSchema);
module.exports = User;