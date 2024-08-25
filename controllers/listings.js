const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index=async(req,res)=>{
  const {category,country}=req.query;
  
  let filter={};
  if(category){
    filter.category=category;
  };
  if (country) {
    filter.country = new RegExp(country, 'i'); // Use regex for case-insensitive search
  };

    // const allListings= await Listing.find({})
    const allListings= await Listing.find(filter);
    res.render("listings/index.ejs",{allListings,selectedCategory: category,selectedCountry: country});
  };

  module.exports.renderNewForm=async(req,res)=>{
    res.render("listings/new.ejs");
 };

 module.exports.createListing=async(req,res,next )=>{
  let response= await geocodingClient.forwardGeocode({
    query: req.body.location,
    limit: 1,
  })
  .send();
  // console.log(response.body.features[0].geometry);
  //  res.send("done");

  let url=req.file.path;
  let filename=req.file.filename;
// console.log(url,"...", filename);
    let {title,description,image,price,country,location,category}=req.body;

  let newListing=new Listing({
    title:title,
    description:description,
    image:image,
    price:price,
    country:country,
    location:location,
    category:category,
  });
  // console.log(newListing);
  // console.log(req.body);
  newListing.owner=req.user._id;
  newListing.image={url,filename};

  newListing.geometry=response.body.features[0].geometry;

  let savedListing=await newListing.save();
  // console.log(savedListing);
  req.flash("success","New Listing Created!");
  res.redirect("/listings");
};

 module.exports.showListing=async(req,res)=>{
    let{id}=req.params;
  const listing= await Listing.findById(id)
  .populate({
    path:"reviews",
    populate:{
      path:"author"
    }
  })
    .populate("owner");
  if(!listing){
    req.flash("error","Listing you requested for does not exist!");
     return res.redirect("/listings");
  }
  // console.log(listing);
  res.render("listings/show.ejs",{listing});
};



module.exports.renderEditForm=async(req,res)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
      req.flash("error","Listing you requested for does not exist!");
     return  res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    let modifiedImageUrl=originalImageUrl.replace("/upload","/upload/w_250"); 
   
    res.render("listings/edit.ejs",{listing,modifiedImageUrl})
};

module.exports.updateListing=async(req,res)=>{
    let {id}=req.params;
    let{title:newTitle,description:newDescription, image:newImage,
       price:newPrice,
      country:newCountry,
      location:newLocation,
    category:newCategory}=req.body;
      
      let updateListing= await Listing.findByIdAndUpdate(id,{title:newTitle,description:newDescription, image:newImage,
        price:newPrice,
       country:newCountry,
       location:newLocation,category:newCategory});
      //  res.redirect("/listings");
      // for update image in edit form
      if(typeof req.file !=="undefined"){
      let url=req.file.path;
      let filename=req.file.filename;
      updateListing.image={url,filename};
      await updateListing.save();
      }
      req.flash("success","listing Updated!");
       res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async(req,res)=>{
    let{id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","listing Deleted!");
    res.redirect("/listings");
};