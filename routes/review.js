// ==============================
// Import Required Packages
// ==============================

const express = require("express");

// ⚠️ IMPORTANT:
// mergeParams: true → parent route ka :id (listingId) access karne ke liye
const router = express.Router({ mergeParams: true });


// ==============================
// Import Models
// ==============================

const Listing = require("../models/listing");
const Review = require("../models/review");
const { isLoggedIn } = require("../middleware");
const { isOwner } = require("../middleware.js");


// ==============================
// Import Utility (Error Handler Wrapper)
// ==============================

const WrapAsync = require("../utils/WrapAsync");


// ==============================
// ⭐ REVIEW FORM ROUTE
// ==============================
// URL: GET /listings/:id/reviews/new
// Kaam: Review form open karega

router.get("/new", (req, res) => {

    // listing ka id URL se le rahe hain
    const { id } = req.params;

    // form ko listingId pass kar rahe hain
    res.render("listings/review.ejs", { listingId: id });
});


// ==============================
// ⭐ CREATE REVIEW
// ==============================
// URL: POST /listings/:id/reviews
// Kaam: Naya review create karega

router.post("/", isLoggedIn , WrapAsync(async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    const { name, rating, comment } = req.body;

    const newReview = new Review({
        name,
        rating,
        comment
    });

    await newReview.save();

    listing.reviews.push(newReview);
    await listing.save();

    // ✅ YAHAN lagana hai flash
    req.flash("success", "Review created successfully!");

    // ✅ SAME PAGE pe redirect
    res.redirect(`/listings/${id}`);
}));


// ==============================
// ⭐ DELETE REVIEW
// ==============================
// URL: DELETE /listings/:id/reviews/:reviewId
// Kaam: Review delete karega

router.delete("/:reviewId", WrapAsync(async (req, res) => {

    // listing id aur review id dono le lo
    const { id, reviewId } = req.params;

    // Step 1: Listing ke andar se review ka reference hatao
    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    });

    // Step 2: Review collection se actual review delete karo
    await Review.findByIdAndDelete(reviewId);

    
    // ✅ Flash message
    req.flash("success", "Review deleted successfully!");

    // ✅ Same page pe redirect
    res.redirect(`/listings/${id}`);
}));


// ==============================
// Export Router
// ==============================

module.exports = router;