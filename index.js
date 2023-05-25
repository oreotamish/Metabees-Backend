//global variables
const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const app = express();
const port = 3000;

//setting up sample mongoose database
mongoose.set("strictQuery",true);
mongoose.connect(process.env.MONGO_KEY).then(function(){
    console.log("Connected to Metabees.in sample database");
}).catch(function(err){
    console.error(err);
});

//middleware to be used for the web application
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan("dev"));

//requiring Passport.js configuration & dotenv
require("./api/config/passportConfig");

//requiring the controllers and routes
const authController = require("./api/controllers/authController");
const authRoutes = require("./api/routes/authRoutes");

//merging routes with routers
app.use("/auth",authRoutes);

//home page
app.get("/",(req,res) =>{
    res.json({
        message:"This is the home page!"
    });
});

//main page routes
app.get("/protected",passport.authenticate('jwt', { session: false }),authController.protected);
app.get("/logout",authController.logout);

//failure route for Google OAuth
app.get("/app/fail",(req,res)=>{
    res.status(500).json({
        message:"Google OAuth failed!"
    });
});

app.listen(port,()=>{console.log("Server started on port",port)});
