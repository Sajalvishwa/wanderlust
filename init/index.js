// =======================================================
// 📦 Import Required Modules
// =======================================================

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../Models/user.js");


// =======================================================
// 🛢️ MongoDB URL (ATLAS)
// =======================================================

const MONGO_URL = process.env.Atlas;

// =======================================================
// 1️⃣ MongoDB Connection
// =======================================================

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}


// =======================================================
// 2️⃣ Seed Function (DATABASE INITIALIZE)
// =======================================================

async function initDB() {
  try {

    // 🗑️ STEP 1: Delete old listings
    await Listing.deleteMany({});
    console.log("🗑️ Old listings deleted");

    // 👤 STEP 2: Get a user (for owner field)
    const user = await User.findOne();

    if (!user) {
      console.log("❌ No user found. Pehle signup karo ya user create karo.");
      return;
    }

    // 🧠 STEP 3: Map data.js into DB format
    const listings = initData.data.map((item) => ({
      title: item.title,
      description: item.description,
      price: item.price,
      location: item.location,
      country: item.country,

      image: {
        url:
          item.image?.url ||
          item.image ||
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
        filename: "sample"
      },

      owner: user._id
    }));

    // 📥 STEP 4: Insert into DB
    const inserted = await Listing.insertMany(listings);

    console.log(`✅ ${inserted.length} listings inserted successfully`);

  } catch (err) {
    console.error("❌ Error initializing DB:", err);
  } finally {
    mongoose.connection.close();
    console.log("🔒 MongoDB connection closed");

  }
}


// =======================================================
// 3️⃣ RUN SCRIPT
// =======================================================

(async () => {
  await main();
  await initDB();
})();