const mongoose = require("mongoose");

async function db(connectionString){
    let connectionResponce = await mongoose.connect(connectionString);
    return connectionResponce;
}

module.exports = db;