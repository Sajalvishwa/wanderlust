const mongoose = require("mongoose");

// ✅ ONLY THIS (no destructuring, no .default)
const passportLocalMongoose = require("passport-local-mongoose").default;

const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  }
});

// ✅ plugin ko function mil raha hai ab
userSchema.plugin(passportLocalMongoose);

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);