// =======================================================
// ⚙️ ENVIRONMENT CONFIGURATION
// =======================================================
// Agar app production mein nahi hai, toh .env file se variables load karo
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
// Line 18 change karein
const MongoStore = require("connect-mongo").default; 
console.log("MongoStore Type:", typeof MongoStore.create); // Session store ke liye
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Models & Utilities
const User = require("./Models/user.js");
const ExpressError = require("./utils/ExpressError");

// Routes Imports
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user");

const dburl = process.env.Atlas; // Aapka MongoDB Atlas URL

// =======================================================
// 🛢️ DATABASE CONNECTION (Atlas)
// =======================================================
mongoose.connect(dburl)
    .then(() => console.log("✅ MongoDB Atlas connected successfully!"))
    .catch((err) => console.log("❌ MongoDB connection error:", err));

const app = express();

// =======================================================
// 🎨 VIEW ENGINE & STATIC FILES SETUP
// =======================================================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =======================================================
// 🔐 SESSION & MONGO STORE CONFIGURATION
// =======================================================
const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret: process.env.SECRET || "mysupersecretcode",
    },
    touchAfter: 24 * 3600,
});

// Store error handling
store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
    store, // MongoStore integration
    secret: process.env.SECRET || "mysupersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

// =======================================================
// 🛡️ PASSPORT AUTHENTICATION SETUP
// =======================================================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =======================================================
// 🌍 GLOBAL VARIABLES (Flash & User context)
// =======================================================
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; // Navbar mein user check karne ke liye
    next();
});

// =======================================================
// 🛣️ ROUTES SETUP
// =======================================================
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

// =======================================================
// ⚠️ ERROR HANDLING MIDDLEWARE
// =======================================================
// 404 Handler
// Yeh har us request ko catch karega jo upar ke routes se match nahi hui
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});
// Global Error Handler
app.use((err, req, res, next) => {
    let { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render("listings/err.ejs", { err });
});

// =======================================================
// 🟢 START SERVER
// =======================================================
const port = 8000;
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});