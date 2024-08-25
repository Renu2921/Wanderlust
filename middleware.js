const Listing=require("./models/listing.js");
const Review=require("./models/review.js");
const ExpressError=require("./utils/ExpressError.js");
const { listingSchema} = require('./schema.js');
const {  reviewSchema } = require('./schema.js');

module.exports.isLoggedIn=(req,res,next)=>{
    // console.log(req.user);
    // console.log(req);
    // console.log(req.path, ".." ,req.originalUrl);
    if(!req.isAuthenticated()){
      // redirct url for req.originalUrl
      req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in to create listing");
        return res.redirect("/login");
       
      };
      next();
};


module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  };
  next();
};

module.exports.isOwner=async(req,res,next)=>{
  // for prevent editing from api call
  let {id}=req.params;
  let listing=await Listing.findById(id);
  if(! listing.owner._id.equals(res.locals.currentUser._id)){
    req.flash("error","You are not the owner of this listing");
   return res.redirect(`/listings/${id}`);
  };
  next();
};
module.exports.isReviewAuthor=async(req,res,next)=>{
  // for prevent editing from api call
  let {id,reviewId}=req.params;
  let review=await Review.findById(reviewId);
  if(! review.author.equals(res.locals.currentUser._id)){
    req.flash("error","You are not the author of this listing");
   return res.redirect(`/listings/${id}`);
  };
  next();
};

// firstly created these middlewares
module.exports. validataListing=(req,res,next)=>{ //this is for backend validations
  let{error}=listingSchema.validate(req.body);
  // console.log(error);
  if(error){
    // let errorMsg=error.details.map((el)=>el.message).join(".");
   throw new ExpressError(400, error);
  //  throw new ExpressError(400, errorMsg);
  } else{
    next();
  }
};

module.exports.validataReview=(req,res,next)=>{
  let{error}=reviewSchema.validate(req.body);
  // console.log(error);
  if(error){
    // let errorMsg=error.details.map((el)=>el.message).join(".");
   throw new ExpressError(400, error);
  //  throw new ExpressError(400, errorMsg);
  } else{
    next();
  }
};
