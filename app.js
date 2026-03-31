// =======================================================
// ⚙️ ENVIRONMENT CONFIGURATION
// =======================================================
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo").default; // ✅ FIXED
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Models & Utils
const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressError");

// Routes
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user");

// =======================================================
// 🛢️ DATABASE CONNECTION
// =======================================================
const dburl = process.env.Atlas;

// ❌ safety check (VERY IMPORTANT)
if (!dburl) {
    console.log("❌ MongoDB Atlas URL missing in environment variables!");
    process.exit(1);
}

mongoose.connect(dburl)
    .then(() => console.log("✅ MongoDB Atlas connected successfully!"))
    .catch((err) => {
        console.log("❌ MongoDB connection error:", err);
        process.exit(1);
    });

// =======================================================
// 🚀 APP INIT
// =======================================================
const app = express();

// =======================================================
// 🎨 VIEW ENGINE & STATIC FILES
// =======================================================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =======================================================
// 🔐 SESSION + MONGO STORE
// =======================================================
const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret: process.env.SECRET || "mysupersecretcode",
    },
    touchAfter: 24 * 3600,
});

// session store error
store.on("error", (err) => {
    console.log("❌ SESSION STORE ERROR:", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET || "mysupersecretkey",
    resave: false,
    saveUninitialized: false, // ✅ better than true
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

// =======================================================
// 🛡️ PASSPORT CONFIG
// =======================================================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =======================================================
// 🌍 GLOBAL VARIABLES
// =======================================================
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// =======================================================
// 🛣️ ROUTES
// =======================================================
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

// =======================================================
// ⚠️ 404 HANDLER
// =======================================================
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// =======================================================
// ❌ GLOBAL ERROR HANDLER
// =======================================================
app.use((err, req, res, next) => {
    let { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render("listings/err.ejs", { err });
});

// =======================================================
// 🟢 SERVER START
// =======================================================
const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});