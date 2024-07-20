process.on('uncaughtException',err=>{
    console.log("ERROR 🔥: ",err)
    process.exit(1);
});
const app=require("./app");
const mongoose=require("mongoose");
const dotenv=require("dotenv");
const {protect} = require("./controllers/authController");
dotenv.config({path:"./config.env"})
const PORT=process.env.PORT||3000;
const server=app.listen(PORT,async ()=>{
    console.log(`the server is running at ${process.env.PORT}`);
    await mongoose.connect(process.env.CONNECTION_STRING,{
        useCreateIndex:true,
        useNewUrlParser:true,
        useFindAndModify:false
    })
    // console.log(process.env.NODE_ENV)
    console.log("connected successfully to database")
});
process.on('unhandledRejection',err=>{
        console.log("ERROR 🔥: ",err.name,err.message)
        console.log("Shutting down ...");
        // process.exit(1);//will abort all running reqeusts
        server.close(()=>{
            process.exit(1);
        })
    }
);

module.exports= {server,mongoose};