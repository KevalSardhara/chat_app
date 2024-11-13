// const { EMITS } = require("../statics/constants");
const { lte } = require("lodash");
// const { getTableFromUser } = require("../redis/service/socket");
const gameController = require("./game.controller");
const config = require("../../config/index");
const { User } = require("../../api/models/user");
const socketService = require('../../socket/service/sockets');
const utility = require("../../socket/controller/utility");

// const gameEvent = (socket, token, noOfPlayer, roomFee, winAmount) => {
const gameEvent = (socket, data) => {
  let { bot, roomSize, roomFee, no_of_tokens } = data;
  let token = bot.tokens[0].token;
  let socketId = socket.id;
  
  socket.emit('join', {
    token: token
  }, (callback) => {
    socket.emit('join_previous');
    if (callback.status === 1) {
      socket.emit('joinPublicTabel', {
        // Pass String Value
        no_of_players: roomSize.toString(),
        room_fee: roomFee.toString(),
        no_of_tokens: no_of_tokens.toString(),
        
      }, (callback) => {
        if (callback.status === 1) {
          // Bot Position
          socket.tokenSize = callback.table.no_of_tokens;
          socket.botPosition = callback.position;
        }
      })
    }
  });

  // socket.on("playerJoin", (params, callback) => {
  //   console.log("Bot playerJoin {{{{{{{{{{}}}}}}}}", params);
  // });
  
  socket.on("make_diceroll", (params) => {
    if(params.position == socket.botPosition) {
      setTimeout(() => {
        gameController.diceRolled(socket, params); // dice_rolled
      }, 1500); // default timeout for bot get turn is 4000ms
    }
  });
  
  socket.on("make_move", (params, callback) => {
    if(params.position == socket.botPosition) {
      setTimeout(() => {
        gameController.moveMade(socket, params); // move_made
      }, 1000);
    }
  });

  // socket.on("startGame", (data) => {
  //   try {
  //     if(data.status == 1 && data.table.current_turn == socket.botPosition) {
  //       console.log("Bot startGame {{{{{{{{{{}}}}}}}}");
  //       // gameController.diceRolled(socket, data.table);
  //     } else {
  //       socket.disconnect();
  //       console.log(error);
  //     }
  //   } catch (error) {
  //     socket.disconnect();
  //     console.log(error);
  //   }
  // });

};

module.exports = {
  gameEvent,
};

