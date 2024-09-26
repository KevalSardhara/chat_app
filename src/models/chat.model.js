const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    chatMessage : {
        type : Array,
        required : true,
        default : [],
    }
});

exports.chatSchema = mongoose.model("Chat", chatSchema);