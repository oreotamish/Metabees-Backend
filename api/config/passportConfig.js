const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const localStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/userModel");
require("dotenv").config();

//session storage to store and retrieve user
passport.serializeUser(function(user,callback){
    callback(null,user);
});

passport.deserializeUser(function(object,callback){
    callback(null,object);
});

//using Google strategy
passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"http://localhost:3000/auth/google/callback"
},async function(accessToken,refreshToken,profile,callback){
    const user = await User.findOne({email:profile.emails[0].value}).exec();

    if(!user){
        const newUser = new User({
            email:profile.emails[0].value,
            fullname:profile.displayName,
            password:null,
            googleId:profile.id
        });
        
        newUser.save().then((user1)=>{
            return callback(null,user1);
        }).catch((error)=>{
            return callback(error);
        });
    }
    else{
        return callback(null,user);
    }
}));

//using Local strategy for email logins
passport.use(new localStrategy({
    secretOrKey:process.env.SECRET_KEY,
    jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken()
},async function(payload,callback){
    const user = await User.findOne({_id:payload.id}).exec();
    if(user){
        return callback(null,user);
    }
    else{
        return callback(null,false);
    }
}));