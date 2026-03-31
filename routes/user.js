const express = require("express");
const router = express.Router();
const passport = require("passport");

const User = require("../Models/user");

// ===============================
// 📝 Signup Form
// ===============================
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

// ===============================
// 🚀 Signup Logic
// ===============================
router.post("/signup", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const newUser = new User({ username, email });

        const registeredUser = await User.register(newUser, password);

        // auto login
        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to WanderLust 🎉");
            res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
});

// ===============================
// 🔐 Login Form
// ===============================
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// ===============================
// 🔑 Login Logic
// ===============================
router.post("/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    (req, res) => {
        req.flash("success", "Welcome back! 👋");
        res.redirect("/listings");
    }
);

// ===============================
// 🚪 Logout
// ===============================
router.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);

        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    });
});

module.exports = router;