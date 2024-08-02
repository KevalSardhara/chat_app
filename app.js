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
const io = new Server(httpServer,/*  {
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
} */);
// console.log(io);

// Handle new connections
io.on('connection', async (socket) => {
    // console.log('A user connected', socket);
    // console.log('A user connected', socket.id);
    // console.log('A user connected', socket.handshake.query);
    // console.log('A user connected', socket.handshake.query.token);

    var socketId = socket.id;
    var clientIp = socket.request.connection.remoteAddress;
    console.log('New connection ' + socketId + ' from ' + clientIp);

    // Join the room with the user's token
    if(socket.handshake.query.token) {
        // socket.join(socket.handshake.query.token); // Join the room with the user's token
        io.to(socketId).emit('private', {data : "You are Join"});
        console.log('A user connected', socketId);
    }
    let user = await User.findOne({token: socket.handshake.query.token});
    if (!user) {
        console.log('A user disconnected', socket.handshake.query.token);
        let responce = {
            event : "resConnectionError",
            data : {
                socket_id : socketId,
            },
            status : 400,
            message :"Somthing went wrong! Please try again later",
        };
        io.to(socketId).emit('resConnectionError', responce);
        return socket.disconnect();
    } else {
        console.log('A user connected', socket.handshake.query.token);
        let responce = {
            event : "resConnected",
            data : {
                socket_id : socketId,
            },
            status : 200,
            message :"Somthing went wrong! Please try again later",
        };
        io.to(socketId).emit('resConnected', responce);
    }

    // Handle a custom event
    socket.on('reqMessage', (data) => {
        console.log('Message received:', data);
        // Broadcast to all clients
        io.emit('resMessage', {data : "hello, thank you for connecting"});
    });
    socket.on('listener', (data) => {
        console.log('add listener:', data);
        io.emit('replaytoyou', {data : "hello, thank you for connecting"});
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
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
