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
io.on('connection', (socket) => {
    // console.log('A user connected', socket);
    // console.log('A user connected', socket.id);
    console.log('A user connected', socket.handshake.query);
    // console.log('A user connected', socket.handshake.query.token);

    // Handle a custom event
    socket.on('message', (data) => {
        console.log('Message received:', data);
        socket.on('listener', (data) => {
            console.log('adddddd');
            io.emit('replaytoyou', {data : "hello, thank you for connecting"});
        });

        // Broadcast to all clients
        io.emit('replay', {data : "hello, thank you for connecting"});
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
