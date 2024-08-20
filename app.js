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

const User = require('./src/models/user');
dotenv.config({
    path: "./.env",
});
const PORT = process.env.PORT || 3000;

// #set
app.set('view engine', 'ejs');
app.set("views", path.join(path.resolve(), "./src/views"));
app.use(cookieParser());

// Socket Events


const { Server } = require("socket.io");
const httpServer = http.createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
// Integrate Socket.IO with proper options
/* const io = new Server(httpServer, {
    cors: {
        // methods: ['GET', 'POST'], // Allow specific methods
        // allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
        // credentials: true, // Allow cookies to be sent with requests
        // optionsSuccessStatus: 200, // Some legacy browsers choke on 204
        origin: function (req, callback) {
            // Allow requests with no req (like mobile apps or curl requests)
            if (!req) return callback(null, true);
            if (allowedOrigins.indexOf(req) === -1) {
                const msg = 'The CORS policy for this site does not allow access from the specified req.';
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
    }
}); */
// ============================================================================
/* 
npm install eiows
require("eiows").Server;
 */
// ============================================================================
const io = new Server(httpServer,  {
    pingInterval: 10000,
    pingTimeout: 30000,
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
global.io = io;
let connectionArr = [];
// Handle new connections
io.on('connection', async (socket) => {
    // console.log('A user connected', socket);
    // console.log('A user connected', socket.id);
    // console.log('A user connected', socket.handshake.query);
    // console.log('A user connected', socket.handshake.query.token);

    var socket_id = socket.id;
    var clientIp = socket.request.connection.remoteAddress;
    let token = null;
    let user = null;
    socket.join("chat_ludo");
    console.log('New connection ' + socket_id + ' from ' + clientIp, ":::::::::::", socket.rooms);
    
    // Active Connection
    // io.on('connection', (socket) => {
    //     console.log(`Active connections: ${Object.keys(io.sockets.sockets).length}`);
    // });

    // Always clean up listeners after disconnect
    // io.on('connection', (socket) => {
    //     socket.on('disconnect', () => {
    //         socket.removeAllListeners();
    //     });
    // });

    // Join the room with the user's token
    if(socket.handshake.query.token) {
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
        let responce = {
            event : "resConnectionError",
            data : {
                socket_id,
            },
            status : 400,
            message :"Somthing went wrong! Token Not Found Plases Provide Token!",
        };
        io.to(socket_id).emit('resConnectionError', responce);
        return socket.disconnect();
    }
    if (!user) {
        let responce = {
            event : "resConnectionError",
            data : {
                socket_id,
            },
            status : 400,
            message :"Somthing went wrong! Please try again later",
        };
        io.to(socket_id).emit('resConnectionError', responce);
        return socket.disconnect();
    } else {
        user.is_online = true;
        user.socket_id = socket_id;
        await user.save();
        // socket.join(user._id);
        console.log("socket>>>>>>>>>>>>>>>>>>>:::::::::>", socket.rooms);
        connectionArr.push({socket_id, user_id: user._id});
        let responce = {
            event : "resConnected",
            data : {
                socket_id,
                is_online: true,
                socket_id: socket_id,
                message : `${user.username} is online`,
            },
            status : 200,
            message :"User connected on this token",
        };
        socket.broadcast.emit('resConnected', responce); // io.emit('resConnected', responce);
        // socket.to("chat_ludo").emit('resConnected', responce); // io.to("chat_ludo").emit('resConnected', responce);
        console.log('User connected', connectionArr, connectionArr.length);
    }

    // Handle a custom event
    socket.on('reqMessage', (data) => {
        // console.log('Message received:', data);
        // Broadcast to all clients
        let responce = {
            event : "resMessage",
            data : {
                ...data,
                message : "hello, thank you for connecting",
                socket_id,
            },
            status : 200,
            message :"success",
        };
        io.emit('resMessage', responce);
    });

    socket.on('reqListener', (data) => {
        let responce = {
            event : "resListener",
            data : {
                ...data,
                message : "Listening to socket",
                socket_id,
            },
            status : 200,
            message :"success",
        };
        io.emit('resListener', responce);
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
        // let socket_id = socket.id;
        user.is_online = false;
        user.socket_id = "";
        await user.save();
        
        let responce = {
            event : "resDisConnection",
            data : {},
            status : 400,
            message : `${user.username} is ofline`,
        };
        connectionArr = await updateConnectionArr(socket_id, connectionArr);
        io.emit('resDisConnection', responce);
        console.log('User disconnected', connectionArr, connectionArr.length);
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
            console.log("Server running on port ::::::::::::::::::::::::::::", PORT);
        });
    })
    .catch((error) => {
        console.log("database connection error", error);
    });
