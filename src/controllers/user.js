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
        let user = await User.findOne(search, {__v : 0});
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






/**
[
  {
    $match: {
      role: {
        $in : ["user"],
      },
      status : 1,
    	is_account_deleted : 0,
    }
  },
  {
    $project: {
      _id: 1,
      username: 1,
      name: 1,
      mobile: 1,
      email: 1,
      last_login_at: 1,
      usable_coin_balance: 1,
      withdrawable_coin_balance: 1,
      createdAt: 1
    }
  },
  {
    $sort: {
      createdAt: -1
    }
  },
  {
    $lookup: {
      from: "contestmatch_users",
      let: { userId: "$_id" },
      as: "matches",
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ["$$userId", "$user_id"]
                },
                {
                  $ne: ["$deleted", "true"]
                }
              ]
            }
          }
        },
        {
          $group: {
            _id: "$contest_match_id",
            uniqueCount: { $sum: 1 },
            firstDocument: { $first: "$$ROOT" }
          }
        },
        {
          $replaceRoot: {
            newRoot: "$firstDocument"
          }
        }
      ]
    }
  },
  {
    $lookup: {
      from: "game_battle_histories",
      let: { user_id: "$_id" },
      as: "gameData",
      pipeline: [
        {
          $unwind: {
            path: "$players",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: [
                    "$$user_id",
                    "$players.userId"
                  ]
                },
                {
                  $eq: [
                    "$gameStatus",
                    "completed"
                  ]
                }
              ]
            }
          }
        },
        {
          $group: {
            _id: "$players.userId",
            uniqueGameCount: { $sum: 1 }
          }
        }
      ]
    }
  },
  {
    $lookup: {
      from: "coin_histories",
      let: { user_id: "$_id" },
      as: "coinHistory",
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$$user_id", "$user_id"]
            }
          }
        },
        {
          $match: {
            $expr: {
              $eq: [
                "$transmission_type",
                "winning"
              ],
              $eq: ["$coin_type", "withdrawable"]
            },
            transmission_sub_type: {
              $in: [
                "withdraw_request",
                "withdraw"
              ]
            },
            status: { $in: ["success"] }
          }
        },
        {
          $group: {
            _id: null,
            withdrawCoin: {
              $sum: "$coins"
            }
          }
        }
      ]
    }
  },
  {
    $lookup: {
      from: "coin_histories",
      let: { user_id: "$_id" },
      as: "coin_deposite",
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$$user_id", "$user_id"]
            }
          }
        },
        {
          $match: {
            $expr: {
              $eq: ["$history_type", "deposit"],
            },
            transmission_type: {
       				$nin: ["winning", "bonus"]
            },
            status: { $in: ["approved", "success"] }
          }
        },
        {
          $group: {
            _id: null,
            deposite: {
              $sum: "$coins"
            }
          }
        }
      ]
    }
  },
  {
    $lookup: {
      from: "user_kyc_details",
      let: { user_id: "$_id" },
      as: "kyc_details",
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$$user_id", "$user_id"]
            }
          }
        },
        {
          $match: {
            $expr: {
              $eq: [ "$type",1 ],
              $eq: ["$deleted", false]
            },
          }
        },
        {
          $group: {
            _id: "$user_id",
            pan_number: {
              "$push": "$id_number"
            }
          }
        }
      ]
    }
  },
  {
    $addFields: {
      total_matches: {
        $size: "$matches"
      }
    }
  },
  {
    $addFields: {
      total_games_obj: {
        $ifNull: [
          { $first: "$gameData" },
          { _id: null, uniqueGameCount: 0 }
        ]
      }
    }
  },
  {
    $addFields: {
      total_games:
        "$total_games_obj.uniqueGameCount"
    }
  },
  {
    $addFields: {
      coin_history_obj: {
        $ifNull: [
          { $first: "$coinHistory" },
          { _id: null, withdrawCoin: 0 }
        ]
      }
    }
  },
  {
    $addFields: {
      total_withdraw_coin:
        "$coin_history_obj.withdrawCoin"
    }
  },
    {
    $addFields: {
      coin_deposite_obj: {
        $ifNull: [
          { $first: "$coin_deposite" },
          { _id: null, deposite: 0 }
        ]
      }
    }
  },
  {
    $addFields: {
      coin_deposite:
        "$coin_deposite_obj.deposite"
    }
  },

      {
    $addFields: {
      pan_number_obj: {
        $ifNull: [
          { $first: "$kyc_details" },
          { _id: null, pan_number: [""] }
        ]
      }
    }
  },
  {
    $addFields: {
      pan_number:{
      	$arrayElemAt: ["$pan_number_obj.pan_number", 0]
      }
    }
  },
  {
    $addFields: {
      last_login_at: {
        $dateToString: {
          format: "%d/%m/%Y %H:%M:%S",
          date: "$last_login_at",
          timezone: "+05:30"
        }
      }
    }
  },
  {
    $addFields: {
      createdAt: {
        $dateToString: {
          format: "%d/%m/%Y %H:%M:%S",
          date: "$createdAt",
          timezone: "+05:30"
        }
      }
    }
  },
  {
    $project: {
      _id: 1,
      username: 1,
      name: 1,
      mobile: 1,
      email: 1,
      last_login_at: 1,
      usable_coin_balance: 1,
      withdrawable_coin_balance: 1,
      createdAt: 1,
      total_matches: 1,
      total_games: 1,
      total_withdraw_coin: 1,
      pan_number : 1,
      coin_deposite : 1
    }
  }
]
 */