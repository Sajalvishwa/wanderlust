// Import mongoose library
const mongoose = require("mongoose");

// Extract Schema constructor from mongoose
const { Schema } = mongoose;

// make schema for reviews
const reviewSchema = new Schema({
   name : String,
   comment:String,
   rating : {
    type:Number,
    min:1,
    max:5,
   } ,
   createdAt:{
    type:Date,
    default:Date.now(),
   },
});

//here we export it...
module.exports =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);