const mongoose = require('mongoose')

//pre signup user model
const preSignupUserSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    fullname:{
        type:String,
        required:true
    }
})

//model
module.exports = mongoose.model('PreSignupUser',preSignupUserSchema)
