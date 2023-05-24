const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
require("dotenv").config();

//controllers for the logging the user out
exports.logout = (req,res)=>{
    res.clearCookie("aToken");
	res.json({
        message:"User successfully logged out!"
    });
};

//controller for accessing the protected route
exports.protected = (req,res)=>{
    if(req.user == null){
        res.status(403).json({
            message:"Unauthorized API call!"
        });
    }
    else{
        //this is the req.user returned by the jwt authentication
        res.json({
            profile:req.user
        });
    }
};

//controllers for the email signup
exports.signup = async (req,res,next)=>{
    const userExists = await User.findOne({email:req.body.email}).exec();
    if(userExists){
        res.status(400).json({
            message:"The user already exists!"
        });
    }
    else{
        const newUser = new User({
            fullname:req.body.fullname,
            email:req.body.email,
            password:bcrypt.hashSync(req.body.password,10),
            googleId:null
        });
                
        newUser.save().then((user)=>{
            const aToken = jwt.sign({id:user._id},process.env.SECRET_KEY,{expiresIn:"1d"});
            res.cookie("aToken",aToken,{httpOnly:true});
            res.json({
                message:"Authenticated!"
            });
        });       
    }
};

//controllers for the email login
exports.login = async (req,res,next)=>{
    const user = await User.findOne({email:req.body.email}).exec();
    if(user){
        if(bcrypt.compareSync(req.body.password,user.password)){
            const aToken = jwt.sign({id:user._id},process.env.SECRET_KEY,{expiresIn:"1d"});
            res.cookie("aToken",aToken,{httpOnly:true});
            res.json({
                message:"Authenticated!"
            });
        }

        else{
            res.status(401).json({
                message: "Invalid password!"
            });
        }
    }
    else{
        res.status(401).json({
            message:"This email is not registered!"
        });
    }
};

//controller for sending the email with the token
exports.forgot_password_email = async(req,res)=>{
    const user = await User.findOne({email:req.body.email}).exec();
    if(!user){
        res.status(401).json({
            message:"User doesn't exist!"
        });
    }
    else{
        const token = await Token.findOne({ userId: user._id });
        if (token) {
            await token.deleteOne();
        }
        else{
            //this generates a random alphanumeric string
            const resetToken = require("crypto").randomBytes(32).toString("hex");
            const hash = await bcrypt.hash(resetToken, 10);
                
            //the token will expire on its own within an hour
            var newToken = new Token({
                token:hash,
                userId:user._id,
                createdAt:Date.now()//current time of creation
            });

            await newToken.save().then();

            //we send the non-hashed token to the user which later gets decoded by the server
            const link = `http://localhost:3000/auth/reset-password/${user._id}/${resetToken}`;

            //adjustin the mail options
            sendEmail.mailOptions.html = `<a href = "${link}">Reset Password</a>`;
            sendEmail.mailOptions.to = user.email;

            //sending the password reset mail
            sendEmail.transporter.sendMail(sendEmail.mailOptions,(error,info)=>{
                if(error){
                    console.log(error);
                }
                else{
                    console.log(info.response);
                }
            });

            res.json({
                message:`Password reset e-mail has been sent! `
            });
        }
    }
};

//controller for resetting the password
exports.reset_password = async(req,res)=>{
    const resetToken = await Token.findOne({userId:req.params.id});

    if(!resetToken){
        res.status(401).json({
            message:"Token invalid or expired!"
        });
    }
    else{
        const isValid = await bcrypt.compare(req.params.token,resetToken.token);

        if(!isValid){
            res.status(401).json({
                message:"Token invalid or expired!"
            });
        }
        else{
            const hash = await bcrypt.hash(req.body.password,10);
            await User.updateOne({_id:req.params.id},{password:hash});
            res.json({
                message:"Password has been reset!"
            });
        }
    }
};