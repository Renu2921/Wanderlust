const express=require("express");
const router=express.Router();  //here const router is an object
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validataListing}=require("../middleware.js");

const listingController=require("../controllers/listings.js");
const multer=require("multer");
const {storage}=require("../cloudConfig.js")
// const upload=multer({dest:"uploads/"});
const upload=multer({storage});


// index route 
router.get("/",wrapAsync(listingController.index));
  
// create route---> 
  // new route form
router.get("/new",isLoggedIn,wrapAsync(listingController.renderNewForm));
  
  //  create route
router.post("/",isLoggedIn,upload.single("image"),validataListing,wrapAsync(listingController.createListing)
);
// router.post("/",upload.single("image"),(req,res)=>{
//   // res.send(req.body);  //it gives empty object means backend not understand the file data
//   res.send(req.file);
// });
  
// show route
  router.get("/:id",wrapAsync(listingController.showListing));
  
  
// edit and update route
router.get("/:id/edit",isLoggedIn, isOwner,wrapAsync(listingController.renderEditForm));
  
router.put("/:id",isLoggedIn,isOwner,upload.single("image"),validataListing,wrapAsync(listingController.updateListing));
  
  
// Delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));
  

module.exports=router;
  