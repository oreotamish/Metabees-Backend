const mongoose = require("mongoose");

//token schema
const tokenSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    token:{
        type:String,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600,// remains active for one hour
      }
});

module.exports = mongoose.model("Token",tokenSchema);