const User = require("../models/user");
const Chat = require("../models/chat.model");
const mongoose = require("mongoose");
const comon = require("../helpers/comon.helper");
const crypto = require("crypto");

exports.available_friends = async (req, res, next) => {
    try {
        const user = req.user;
        const findStatusDeleted = comon.findStatusDeleted();
        const filterResult = { password : 0, __v : 0, status : 0, is_account_deleted : 0 };

        const chatRequsetInfo = await Chat.aggregate([
            {   
                $match: {
                    group_type_number: 2,
                    status_type : { $in : ["pending", "accepted"] },
                    sender_id: user._id,
                    receiver_id: user._id,
                },
            },
            {
                $group: {
                    _id : null,
                    sender_id : { $addToSet: "$sender_id" },
                    receiver_id : { $addToSet: "$receiver_id" }
                }
            },
            {
                $project: {
                    user_id: { 
                            $setUnion: [ "$sender_id", "$receiver_id" ]
                        },       
                    }
            }
        ]);
        
        const friends = await User.find({ _id : chatRequsetInfo.length != 0 ? { $nin : chatRequsetInfo[0].user_id } : { $ne : user._id }, ...findStatusDeleted }, filterResult).collation({'locale':'en'}).sort({'username':1});

        return res.status(200).json({
            data : friends,
            message : "success",
            status: 200,
        });
    } catch (e) {
        return res.status(200).json({
            data : {},
            message: e.message,
            status: 400,
        });
    }
}

exports.send_friend_request = async (req, res, next) => {
    try {
        let { receiver_id }= req.body;

        const user = req.user;
        const findStatusDeleted = comon.findStatusDeleted(); // For User Table
        let room_id_number = "1";
        let getChatRoomExists = [];
        
        const chat = await Chat.findOne({ sender_id: user._id, receiver_id: new mongoose.Types.ObjectId(receiver_id), status : 1, is_deleted : false });
        if(chat) {
            throw new Error("Friend request already sent.");
        }

        const receiver = await User.findOne({ _id: new mongoose.Types.ObjectId(receiver_id), ...findStatusDeleted });
        if (!receiver) {
            throw new Error("Receiver not found! Please try again.");
        }
        
        do {
            room_id_number = crypto.randomBytes(18).toString('base64url');
            getChatRoomExists = await Chat.find({ room_id_number, status : 1, is_deleted : false });
        } while(getChatRoomExists.length > 0);

        const newChat = new Chat({
            sender_id: user._id,
            receiver_id: new mongoose.Types.ObjectId(receiver_id),
            room_id_number: room_id_number,
            group_type: "one_on_one",
            group_type_number: 2,
            participant_count: 2,
            status_type: "pending",
            ...findStatusDeleted
        });

        await newChat.save();

        return res.status(200).json({
            data: newChat,
            message: "Friend request sent successfully",
            status: 200,
        });
    } catch (e) {
        // next(error);
        return res.status(200).json({
            data : "",
            message: e.message,
            status: 400,
        });
    }
}