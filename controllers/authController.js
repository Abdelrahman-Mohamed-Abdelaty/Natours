const User=require("../models/user");
const jwt= require("jsonwebtoken");
const {promisify}=require("util")
const AppError=require("../utils/appError");
const crypto=require("crypto");
const bcrypt=require("bcrypt");
const Email=require("../utils/email")
const catchAsync=require("../utils/catchAsync");
const sendToken=(user,statusCode,res)=>{
    const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    })
    let cookiesOptions={
        httpOnly:true,
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        // secure:true,// for https only
    }
    user.password=undefined;
    if(process.env.NODE_ENV==='production'){
        cookiesOptions.secure=true;
    }
    res.cookie('jwt',token,)
    res.status(statusCode).json({
        status:"success",
        token,
        user
    })
}
exports.logout=catchAsync(async (req,res,next)=>{
    res.cookie('jwt','logged-out',{
        httpOnly:true,
        expires:new Date(Date.now()),
    })
    res.status(200).json({
        status:"success",
    })
})
exports.signup=catchAsync(async(req,res,next)=>{
    const {password,passwordConfirm,name,email}=req.body;
    const url=`${req.protocol}://${req.get('host')}/me`
    const newUser=await User.create({password,passwordConfirm,name,email});
    await new Email(newUser,url).sendWelcome();
    sendToken(newUser,201,res);
})
exports.login=catchAsync(async (req,res,next)=>{
    const {email,password}=req.body;
    //check if email exists in database
    const user= await User.findOne({email}).select("+password");
    //check if password is correct
    if(!user||!await user.correctPassword(password)){
        return next(new AppError("email or password is not correct",400))
    }
    sendToken(user,200,res);
})

exports.protect=catchAsync(async (req,res,next)=>{
    //get the token
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token=req.headers.authorization.split(" ")[1];
    }else if(req.cookies.jwt){
        token=req.cookies.jwt
    }
    if(!token){
       return next(new AppError("you are not logged in,log in to get access",401))
    }
    //verify the token
    const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET);     //throw error if invalid signature else return payload
    //if user exists, it may be delete and still have a valid token
    const user=await User.findById(decoded.id);
    if(!user){
        return next(new AppError("User no longer exists",401))
    }
    //if user change password after creating the token
    if(user.changesPasswordAfter(decoded.iat)){
        return next(new AppError("User recently change password,Please log in again",401))
    }
    req.user=user;
    res.locals.user=user;
    next();
})

exports.isLoggedIn=async (req,res,next)=>{
    //get the token
    if(req.cookies.jwt) {
        try{
            const token = req.cookies.jwt
            //verify the token
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);     //throw error if invalid signature else return payload
            //if user exists, it may be delete and still have a valid token
            const user = await User.findById(decoded.id);
            if (!user) {
                return next();
            }
            //if user change password after creating the token
            if (user.changesPasswordAfter(decoded.iat)) {
                return next();
            }
            //will be available in rendered pug files
            res.locals.user = user;
            return next();
        }catch (err){
            return next();
        }
    }
    next();
}

exports.restrictTo=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role) )
            return next(new AppError("you don't have permssion to perform this action",403));
        next();
    }
}
exports.forgotPassword=catchAsync(async (req,res,next)=>{
    const {email}= req.body;
    const user= await User.findOne(req.body)
    if(!user){
        return next(new AppError("Email doesn't exist",404))
    }
    const resetToken=user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});
    const resetUrl=`${req.protocol}://${req.get('host')}/api/v1/${resetToken}`;
    try{
        await new Email(user,resetUrl).sendPasswordReset();
        res.status(200).json({
            status:"success",
            message:"Token was send to email"
        })

    }catch (err){
        this.passwordResetToken=undefined;
        this.passwordResetExpires=undefined;
        await user.save({validateBeforeSave: false});
        return next(new AppError('There is an error sending the email,Try again later',500))
    }

})
exports.resetPassword=catchAsync(async (req,res,next)=>{
    //1) Get user based on reset token
    const passwordResetToken=crypto.createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    const user=await User.findOne({passwordResetToken,passwordResetExpires:{$gt:Date.now()}});
    if(!user){
        next(new AppError("Invalid reset token",400))
    }
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
    await user.save();
    sendToken(user,200,res);
})
exports.udatePassword=catchAsync(async (req,res,next)=>{
   //check if the previous password is correct
    const user=await User.findById(req.user._id).select("+password");
    if(!(await user.correctPassword(req.body.passwordCurrent))){
        next(new AppError('Your  current password is not correct'))
    }
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    const newUser=await user.save()
    sendToken(newUser,200,res);
})