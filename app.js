if(process.env.NODE_ENV !="production"){
    require("dotenv").config();
}
// console.log(process.env.SECRET);
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");



const listingRouter=require("./routes/listing.js"); //for the router
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");


const path=require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const dbUrl=process.env.ATLASDB_URL;
 main().then((result)=>{
    console.log("connection successful to db");
}).catch((error)=>{
    console.log(error);
})


async function main() {
    
    await mongoose.connect(dbUrl);
}  

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",error);
})

app.use(session({       //middleware
    store,
    secret:process.env.SECRET,  
    resave:false, 
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        }

 }));   
 app.use(flash());

 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new LocalStrategy(User.authenticate()));
 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());

 app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.errorMsg=req.flash("error");
    res.locals.currentUser=req.user;
    next();
    
 });

const port=8080;
app.listen(port,()=>{
    console.log("server is listening the port");
});

// app.get("/",(req,res)=>{
//     res.send("hii i am root");
// })

app.use("/listings",listingRouter);  //this line for the listings router
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.get("*",(req,res)=>{
  throw new ExpressError(401,"Page not found!");
})

app.use((err,req, res, next)=>{
  // res.send("Something went wrong!");
  let{statusCode=500,message="Something Went Wrong"}=err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("listings/error.ejs",{message});
})
