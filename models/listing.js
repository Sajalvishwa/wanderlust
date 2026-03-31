const mongoose = require("mongoose");
const { Schema } = mongoose;

/*
|--------------------------------------------------------------------------
| Listing Schema
|--------------------------------------------------------------------------
*/

const listingSchema = new Schema({

  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    trim: true,
  },

 image: {
  url: {
    type: String,
    default: "https://media.istockphoto.com/id/2243844827/photo/silhouette-of-a-men-in-front-of-a-circular-portal-over-desert-dunes-gazing-toward-a-sky-with.jpg?s=2048x2048&w=is&k=20&c=rfApjCgyTWYopGnCVSFYxVBcWxZf9aAn_nNpkLHx9Ok=",
  },
  filename: {
    type: String,
    default: "default-image",
  }
},

  price: {
    type: Number,
    min: 0,
  },

  location: String,
  country: String,

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  // 🔥 IMPORTANT FIX
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
});

/*
|--------------------------------------------------------------------------
| Delete Reviews Cascade
|--------------------------------------------------------------------------
*/

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await mongoose.model("Review").deleteMany({
      _id: { $in: listing.reviews }
    });
  }
});

/*
|--------------------------------------------------------------------------
| Model Export (safe)
|--------------------------------------------------------------------------
*/

module.exports =
  mongoose.models.Listing || mongoose.model("Listing", listingSchema);