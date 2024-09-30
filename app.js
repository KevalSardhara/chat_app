const express = require("express");
const app = express();
const http = require("http");
const dotenv = require("dotenv");
const db = require('./src/db/database');
const path = require("path");
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const routerFrontAPI = require('./src/routes/front');
const EventEmitter = require('events');
const { updateConnectionArr } = require("./src/helpers/update.socket");
global.myEmitter = new EventEmitter();
const jwt = require('jsonwebtoken');
const responceHandler = require('./src/helpers/responce.helper');

const User = require('./src/models/user');
dotenv.config({
    path: "./.env",
});
const PORT = process.env.SOCKET_PORT || 3000;

// #set
app.set('view engine', 'ejs');
app.set("views", path.join(path.resolve(), "./src/views"));
app.use(cookieParser());

// Socket Events


const { Server } = require("socket.io");
const { listeners } = require("process");
const httpServer = http.createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

const io = new Server(httpServer, {
    pingInterval: 10000,
    pingTimeout: 30000,
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
global.io = io;
let connectionArr = [];

/* io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
            socket.user = decoded;
            console.log("socket.user", socket.user, socket.id);
            next();
        });
    } else {
        next(new Error('Authentication error'));
    }
}); */

// Handle new connections
io.on('connection', async (socket) => {
    var socket_id = socket.id;
    var clientIp = socket.request.connection.remoteAddress;
    let token = null;
    let user = null;
    // socket.join("chat_ludo");
    // console.log('New connection ' + socket_id + ' from ' + clientIp, ":::::::::::", socket.rooms);
    socket.removeAllListeners();
    let responce = '';
    console.log("SOCKET...:::::::::::::::::::::::::::::::::::...", socket_id);
    
    
    // socket.on('ping', (params, callback) => {
    //     // in callback function
    // ----------------------------------USE BELOW CODE FOR PING EVENT------------------------------------------------ //
        // setInterval(() => {
        //     io.to(socket_id).emit('ping', {socket_id: socket_id});
        //     console.log("SOCKET...:::::::::::::::::::::::::::::::::::...", socket_id);
        // }, 3000);
    // --------------------------------------------------------------------------------------------------------------- //
        //     params = {
    //         ...params,
    //         socket_id,
    //     }
    //     callback(params);
    // });
    
    socket.on("join", async (params, callback) => {
        // Join the room with the user's token
        let data = {
            socket_id,
        };
        if (socket.handshake.query.token == params.token) {
            // socket.join(socket.handshake.query.token); // Join the room with the user's token
            token= socket.handshake.query.token;
            user = await User.findOne({token: token});
            // if(user.is_online == true && user.socket_id != "") {
            //     // let socket_id = socket.id;
            //     user.is_online = false;
            //     user.socket_id = "";
            //     await user.save();
            //     let responce = {
            //         event : "resConnectionError",
            //         data : {
            //             socket_id,
            //         },
            //         status : 400,
            //         message :"login to another device",
            //     };
            //     connectionArr = await updateConnectionArr(socket_id, connectionArr);
            //     console.log('User disconnected login to another device', connectionArr, connectionArr.length);
            //     io.to(socket_id).emit('resConnectionError', responce);
            //     return socket.disconnect();
            // }
        } else {
            responce = responceHandler.emitMessage('resConnectionError', data, 400, "Somthing went wrong! Token Not Found Plases Provide Token!");
            io.to(socket_id).emit('resConnectionError', responce);
            return socket.disconnect();
        }
        
        if (!user) {
            responce = responceHandler.emitMessage('resConnectionError', data, 400, "Somthing went wrong!");
            io.to(socket_id).emit('resConnectionError', responce);
            return socket.disconnect();
        } else {
            user.is_online = true;
            user.socket_id = socket_id;
            await user.save();
            // socket.join(user._id);
            connectionArr.push({socket_id, user_id: user._id});
            data = {
                socket_id,
                is_online: true,
                socket_id: socket_id,
                message : `${user.username} is online`,
            };
            responce = responceHandler.emitMessage('resConnected', data, 200, "User connected on this token");
            callback(responce);
            // RESPONCE WITH LISTNERS
            // socket.broadcast.emit('resConnected', responce);
            // console.log('User connected', connectionArr, connectionArr.length);
        }
    });

    socket.on("joinRoom", (params, callback) => {
        socket.join(params.roomId);
    });
    
    // Handle a custom event
    socket.on('reqMessage', (params, callback) => {
        let data = {
            socket_id,
        };
        // console.log('Message received:', data);
        // Broadcast to all clients
        data = {
            ...params,
            message: "hello, thank you for connecting",
            socket_id,
        };
        let responce = responceHandler.emitMessage('resMessage', data, 200, "success");
        // callback(responce);
        io.emit('resMessage', responce);
    });

    socket.on('reqListener', (params, callback) => {
        let data = {
            socket_id,
        };
        data = {
            ...params,
            message: "Listening to socket",
            socket_id,
        };
        responce = responceHandler.emitMessage('resListener', data, 200, "success");
        callback(responce);
        // io.emit('resListener', responce);
    });
    
    // Handle disconnection
    socket.on('disconnect', async () => {
        // let socket_id = socket.id;
        let data = {
            socket_id,
        };
        let message = "";
        if(user) {
            user.is_online = false;
            user.socket_id = "";
            await user.save();
            message = `${user.username} is ofline`;
        } else {
            message = "somthing went wrong! connection disconnected";
        }
        
        data = {
            ...data,
        };
        let responce = responceHandler.emitMessage('resDisConnection', data, 400, message);
        connectionArr = await updateConnectionArr(socket_id, connectionArr);
        io.emit('resDisConnection', responce);
        // console.log('User disconnected', connectionArr, connectionArr.length);
    });
});


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(path.join(path.resolve(), "/public"))); // Uncomment this line to serve static files

app.use("/front", routerFrontAPI);
// app.use("/admin", routerAdmin); // Comming Soon

app.use((req, res, next) => {
    var url = req.protocol + '://' + req.get('host') + req.originalUrl
    let request = Object.assign({ request: { params: req.query, url, body: req.body } })
    let default_response = {
        status: 401,
        message: 'Authorization required',
        req: Object.assign({ url: req.originalUrl }, { params: req.query }, { body: req.body })
    }
    /* 
        // Save history in Database for in direct access by the user
        // let webhook = new Webhook({
        //     ...request,
        // })
        // await webhook.save()
     */
    res.status(200).send(default_response);
})
/* 
// all error handling hear
// app.use((err, req, res, next) => {
//     return res.status(200).json({
//         data: {},
//         message: err.message,
//         status: 400,
//     });
// }); */
// require('./socket');


db(process.env.MONGODB_URL || "")
    .then(async (result) => {
        console.log("result", process.env.MONGODB_URL);
        await httpServer.listen(PORT, () => {
            console.log("Server running on port :::::::::::::::::::::::::::: ...APPLICATION STARTED FOR APPLY IPO...", PORT);
        });
    })
    .catch((error) => {
        console.log("database connection error", error);
    });
