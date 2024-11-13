const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    room_id_number: {
        type: String,
        default: "1",
    },
    images : {
        type: String,
        default: ""
    },
    user_length : {
        type: Number,
        default: 0
    },
    chat_info: [{
        sender_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        receiver_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        chat_messages : {
            type: String,
            default: ""
        },
        chat_type : {
            type: String,
            default: "" // messages, documents, photos, videos, etc
        },
        is_deleted : {
            type: Boolean,
            default: false
        }
    }, {
        timestamps: true
    }],
    status: {
        type: Number,
        default: 1
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const ChatMessage = mongoose.model("Chat_Message", messageSchema);
module.exports = ChatMessage;