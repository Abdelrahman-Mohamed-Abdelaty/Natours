const mongoose =require("mongoose");
const bcrypt=require("bcrypt");
const crypto= require("crypto")
const validator=require("validator")
const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name "],
    },
    email:{
        type:String,
        unique:true,
        required:[true,"Please enter your email"],
        lowerCase:true,
        validate:[validator.isEmail,"Please enter a valid email"],
    },
    photo:{
        type:String,
        default:'default.jpg'
    },
    password:{
        type:String,
        required:true,
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:true,
        //required as input not as saved in database
        validate:{
            validator:function (val){
                return val===this.password;
            },
            message:"Password are not the same as password confirm"
        }
    },
    passwordChangedAt:Date,
    role:{
        type:String,
        enum:{
            values:['user','admin','guide','lead-guide'],
            mongoose:"role should be user' or 'admin' or 'guide' or 'lead-guide'"
        },
        default:'user',
    },
    passwordResetToken:{
        type:String,
    },
    passwordResetExpires:{
        type:String,
    },
    active:{
        type:Boolean,
        select:false,
        default:true
    }
})

userSchema.pre('save',async function (next){
    //runs after validations
    if(!this.isModified('password')) return next();
    this.password=await bcrypt.hash(this.password,12);
    this.passwordConfirm=undefined;
    next();
})
userSchema.pre('save',function (next){
    if(!this.isModified('password')||this.isNew) return next();
    this.passwordChangedAt=Date.now();
    next();
})
userSchema.pre(/^find/,function (next){
    this.find({active: {$ne:false}})
    next();
})
userSchema.methods.correctPassword=async function (data){
    const correct= await bcrypt.compare(data,this.password);
    return correct;
}
userSchema.methods.changesPasswordAfter= function (JWTTimeStamp){
    if(this.passwordChangedAt){
        const changedTimeStamp=parseInt(this.passwordChangedAt.getTime()/1000,10);
        return changedTimeStamp>JWTTimeStamp;
    }
    return false;
}
userSchema.methods.createPasswordResetToken=function (){
    const resetToken=crypto.randomBytes(32).toString('hex');
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires=Date.now()+10 * 60 * 1000;
    return resetToken;
}
module.exports=mongoose.model('User',userSchema);