const mongoose = require('mongoose')
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
console.log("MONGO_URI from env:", process.env.MONGO_URI);
const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected to DB")
    }catch(err){
        console.error("DB connection error:",err.message);
        process.exit(1);
    }
};
module.exports=connectDB;