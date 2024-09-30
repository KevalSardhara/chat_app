const mongoose = require("mongoose");
const chattSchema = mongoose.Schema;

const chatSchema = new mongoose.Schema({
    room_id_number: {
        type: String,
        default: "1",
    },
    request_accept: {
        type: Boolean,
        default: false
    },
    group_type : {
        type: String,
        default: "one_on_one", // one_on_one, group
        enum: ["one_on_one", "group"]
    },
    group_type_number : {
        type: Number,
        default: 2, // one_on_one: 2, group: 3
        enum: [2, 3]
    },
    participant_count : {
        type : Number,
        default : 1
    },
    status_type : {
        type: String,
        default: "pending", // pending, accepted, rejected
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    user_group: {
        type: Array,
        default: [],
    },
    request_history : {
        type: Object,
        default: {}
    },
    status: {
        type: Number,
        default: 1
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;