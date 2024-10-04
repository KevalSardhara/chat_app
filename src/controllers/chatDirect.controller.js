const User = require("../models/user");
const ChatDirect = require("../models/chat_direct.model");

exports.getUserForChat = async (params) => {
    try {
        const { sender_id, receiver_id } = params;
        
    } catch (error) {
        return error;
    }
}