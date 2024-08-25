const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");

const userSchema=new Schema({
   email:{
    type:String,
    required:true,
   }
});


userSchema.plugin(passportLocalMongoose);    //it gives automatically username,hashing,salting and hashed password privides

const User=mongoose.model("User",userSchema);

module.exports=User;

