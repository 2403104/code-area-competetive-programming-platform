const mongoose=require('mongoose');
const path=require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectToMongo=async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to Mongo db successfully...");
    }catch(err){
        console.log("Unable to  connect to Mongodb..");
        console.log(err)
    }
}
module.exports=connectToMongo;