/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require('express')
var cors = require('cors')
const path = require('path');
require('dotenv').config()
const app = express()
// const router = express.Router()
const mongoose = require('mongoose')
const port = process.env.PORT;
require('./src/socket');
const { middleware } = require('express-ctx');
const EventEmitter = require('events');
global.myEmitter = new EventEmitter();

mongoose.connect(process.env.MONGODB_URL).then((result) => {
  console.log("Connected to MongoDB");
})
.catch(err => {
  console.error("Error connecting to MongoDB:", error);
});