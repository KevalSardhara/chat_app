const mongoose = require("mongoose");
const chattSchema = mongoose.Schema;

const chatSchema = new mongoose.Schema({
    room_id_number: {
        type: String,
        unique: true,
        default: "1",
    },
    group_type : {
        type: String,
        default: "one_on_one", // one_on_one, group
        enum: ["one_on_one", "group", "community"]
    },
    group_type_number : {
        type: Number,
        default: 2, // one_on_one: 2, group: 3, community : 4
        enum: [2, 3]
    },
    participant_count : {
        type : Number,
        default : 2
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    is_block: {
        type: Boolean,
        default: false
    },
    group_members: {
        type: Array,
        default: [],
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

const ChatDirect = mongoose.model("chat_direct", chatSchema);
module.exports = ChatDirect;