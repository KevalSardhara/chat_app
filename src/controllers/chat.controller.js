const User = require("../models/user");
const Chat = require("../models/chat.model");
const mongoose = require("mongoose");

exports.available_friends = async (req, res, next) => {
    try {
        const user = req.user;
        
        const chatRequsetInfo = await Chat.aggreate([
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
        
        const friends = await User.find({ _id : chatRequsetInfo.length != 0 ? chatRequsetInfo[0].user_id : user._id, status : 1, is_account_deleted : 0 }, filterResult);

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
        const { receiver_id } = req.body;
        const user = req.user;
        receiver_id = JSON.parse(receiver_id);
        receiver_id = receiver_id.map(receiver_id_obj => mongoose.Types.ObjectId(receiver_id_obj));

        const receiver = await User.find({ _id: { $in : receiver_id }, status: 1, is_account_deleted: 0 });
        if (receiver.length <= 0) {
            throw new Error("Receiver not found!");
        }

        const chatInfo = await Chat.find({ group_type_number: 2 });

        return res.status(200).json({
            data:[],
            status: 200,
            message: "Friend request sent successfully",
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