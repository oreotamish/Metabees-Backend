const mongoose = require("mongoose");

//user schema
const userSchema = new mongoose.Schema({
    fullname:{
        required:true,
        type:String
    },
    email:{
        required:true,
        type:String,
        unique:true
    },
    googleId:{
        type:String
    },
    password:String
});

module.exports = mongoose.model("User",userSchema);