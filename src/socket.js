const express = require("express");
const app = express();
const http = require("http");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const httpServer = http.createServer(app);

dotenv.config({
    path: "./.env",
});
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
// Integrate Socket.IO with proper options
const io = new Server(httpServer, {
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
});
// Handle new connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle a custom event
    socket.on('message', (data) => {
        console.log('Message received:', data);

        // Broadcast to all clients
        io.emit('message', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});