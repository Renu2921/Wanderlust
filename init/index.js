
const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js")

main().then((result)=>{
    console.log("connection successful to db");
}).catch((error)=>{
    console.log(error);
})

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"66c43b730d65e6f77817475f"}))
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}
initDB();

