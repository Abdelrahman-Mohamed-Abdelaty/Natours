const express= require("express");
const morgan= require("morgan");
const path=require("path");
const cookieParser=require('cookie-parser')
const rateLimit=require("express-rate-limit");
const helmet=require("helmet");
const xss=require("xss-clean");
const hpp=require('hpp')
const mongoSantize=require("express-mongo-sanitize")
const AppError=require("./utils/appError");
const globalErrorHandler=require("./controllers/errorController")
const tourRouter=require("./routes/tour");
const userRouter=require("./routes/users");
const reviewRouter=require("./routes/review")
const viewRouter=require("./routes/view")
const bookingRouter=require("./routes/booking")
const bookingController=require("./controllers/booking")
const compression=require('compression');
const cors=require('cors')
const bodyParser=require('body-parser');
const app=express();
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));
//middlewares
app.enable('trust proxy');
//Implement CORS
app.use(cors());
// app.use(cors({
//   origin:'https://forntend.come',//this only ollowed
// }));
//here we apply preflight request
app.options('*',cors());
app.use(express.static(path.join(__dirname,'public')));
//Set security headers
app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
          baseUri: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          scriptSrc: [
            "'self'",
            'https:',
            'http:',
            'blob:',
            'https://*.mapbox.com',
            'https://js.stripe.com',
            'https://*.cloudflare.com',
          ],
          frameSrc: ["'self'", 'https://js.stripe.com'],
          objectSrc: ['none'],
          styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
          workerSrc: ["'self'", 'data:', 'blob:'],
          childSrc: ["'self'", 'blob:'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: [
            "'self'",
            'blob:',
            'wss:',
            'https://*.tiles.mapbox.com',
            'https://api.mapbox.com',
            'https://events.mapbox.com',
          ],
          upgradeInsecureRequests: [],
        },
      },
    })
);

const limiter=rateLimit({
  max:100,
  windowMs:60*60*1000,
  message:'Tour many requests from this IP,please try in an hour'
})
//Data sanitization against NoSQL injection
app.use(mongoSantize())
app.use(compression());//for text send in responses
//Data sanitize against from xss
app.use(xss());

//Prevent parameter pollution
app.use(hpp({
  whitelist:['duration','ratingsQuantity','ratingsAverage','maxGroupSize','price','difficulty']
}));
app.use('/api',limiter);
app.post('/webhook-checkout',bodyParser.raw({
  type:'application/json'
}),bookingController.webhockCheckout);
//here because webhockCheckout needs data in raw form not json
app.use(cookieParser())
app.use(express.json({limit:'10kb'}));// 10 kilo byte as max for denial attacks
app.use(express.urlencoded({extended:true,limit:'10kb'}));// for sending requests from forms
if(process.env.NODE_ENV==="development"){
  app.use(morgan("dev"));
}

//routes
app.use('/',viewRouter)
app.use("/api/v1/tours",tourRouter);
app.use("/api/v1/users",userRouter);
app.use("/api/v1/reviews",reviewRouter);
app.use("/api/v1/bookings",bookingRouter);
app.all("*",(req,res,next)=>{
  const err=new AppError(`Can't find ${req.originalUrl} on this server`,404);
  next(err);
});
//Error handling
//express automatically knows it's error handling middleware because it 4 argument
app.use(globalErrorHandler);
module.exports=app;
