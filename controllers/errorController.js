const AppError=require("../utils/appError")
const handleCastErrorDB=(err)=>{
    const message=`Invalid ${err.path}: ${err.value}`
    return new AppError(message,400);
}
const handleDuplicateFieldsDB=(err)=>{
    const value=err.errmsg.match(/(?:"[^"]*"|^[^"]*$)/)[0].replace(/"/g, "");
    const message=`Duplicate field value ${value}, Please enter another value`;
    return new AppError(message,400);
}
const handleValidationErrorDB=(err)=>{
    const message=Object.values(err.errors).map(err=>err.message).join(". ");
    return new AppError(message,400);
}
const handleJsonWebTokenError=()=>{
    const message=`Invalid token,Please login again`;
    return new AppError(message,401);
}
const handleTokenExpiredError=()=>{
    const message=`Tokes expired,Please login again`;
    return new AppError(message,401);
}
const sendErrorDev=(err,req,res)=>{
    if(req.originalUrl.startsWith("/api")) {
        return res.status(err.statusCode).json({
            message: err.message,
            status: err.status,
            stack: err.stack,
            error: err
        })
    }
    console.error("Error 💣️💣️💣️", err);
    res.status(err.statusCode).render('error',{
        msg: err.message,
        title:'Something went wrong'
    })
}
const sendErrorProd=(err,req,res)=>{
    if(req.originalUrl.startsWith("/api")) {
        if (err.isOperational) {
            return res.status(err.statusCode).json(
                {
                    message: err.message,
                    status: err.status,
                }
            )
        }
        //programming errors
        console.error("Error 💣️💣️💣️", err)
        return res.status(500).json(
            {
                message: "Something went wrong",
                status: "error",
            }
        )
    }
    //RENDRING ERROR
    if (err.isOperational) {
        console.error("Error 💣️💣️💣️", err);
        return res.status(err.statusCode).render('error',{
            msg: err.message,
            title:'error'
        })
    }
    //programming errors
    console.error("Error 💣️💣️💣️", err)
    return res.status(500).render('error',
        {
            msg: "Something went wrong",
            title: "error",
        }
    )


}
module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode||500;
    err.status=err.status||"error";
    if(process.env.NODE_ENV==='development'||process.env.NODE_ENV==='test'){
        sendErrorDev(err,req,res);
    }else if(process.env.NODE_ENV==='production'){
        let error={...err};
        error.message=err.message;
        if(err.name==='CastError'){
            error=handleCastErrorDB(err);
        }
        if(err.name==='ValidationError'){
            error=handleValidationErrorDB(err);
        }
        if(err.code=== 11000){
            error=handleDuplicateFieldsDB(err);
        }
        if(err.name==="JsonWebTokenError"){
            error=handleJsonWebTokenError();
        }
        if(err.name==="TokenExpiredError"){
            error=handleTokenExpiredError();
        }

        sendErrorProd(error,req,res);
    }
}