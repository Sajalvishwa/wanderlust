const express = require("express");
const router = express.Router();

const Listing = require("../models/listing");
const upload = require("../middleware/upload");

const { isLoggedIn, isOwner } = require("../middleware");
const WrapAsync = require("../utils/WrapAsync");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema");

// ================= VALIDATION =================
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate({ listing: req.body.listing });

    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, msg);
    }
    next();
};

<!-- 🔍 SIMPLE DESKTOP SEARCH (BACK TO OLD STYLE) -->
// ================= INDEX + SEARCH (FINAL FIX) =================
router.get("/", WrapAsync(async (req, res) => {

    let { q } = req.query;

    let allListings;

    if (q && q.trim() !== "") {
        allListings = await Listing.find({
            $or: [
                { title: { $regex: q, $options: "i" } },
                { location: { $regex: q, $options: "i" } }
            ]
        });
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings, q });
}));


// ================= INDEX =================
router.get("/", WrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// ================= NEW =================
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

// ================= CREATE =================
router.post("/",
    isLoggedIn,
    upload.single("image"),   // 🔥 must match form name
    validateListing,
    WrapAsync(async (req, res) => {

        
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;

        // ✅ CLOUDINARY SAVE
        if (req.file) {
            newListing.image = {
                url: req.file.path,       // 🔥 MOST IMPORTANT FIX
                filename: req.file.filename
            };
        }

        await newListing.save();

        req.flash("success", "Listing created!");
        res.redirect("/listings");
    })
);

// ================= SHOW =================
router.get("/:id", WrapAsync(async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate("reviews")
        .populate("owner");

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/show.ejs", { listing });
}));

// ================= EDIT =================
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    WrapAsync(async (req, res) => {

        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }

        let orignalimage= listing.image.url;
        orignalimage= orignalimage.replace("/upload","/upload/,w_250")
        res.render("listings/edit.ejs", { listing });
    })
);

// ================= UPDATE =================
router.put("/:id",
    isLoggedIn,
    upload.single("listing[image]"),   // 🔥 image receive karega
    WrapAsync(async (req, res) => {

        let { id } = req.params;

        let listing = await Listing.findById(id);

        // 🔥 agar new image upload hui hai
        if (req.file) {
            listing.image = {
                url: req.file.path,       // Cloudinary URL
                filename: req.file.filename
            };
        }

        // 🔥 baki fields update karo
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });

        await listing.save(); // image update save

        req.flash("success", "Listing updated!");
        res.redirect(`/listings/${id}`);
    })
);

// ================= DELETE =================
router.delete("/:id",
    isLoggedIn,
    isOwner,
    WrapAsync(async (req, res) => {

        const { id } = req.params;

        await Listing.findByIdAndDelete(id);

        req.flash("success", "Listing deleted!");
        res.redirect("/listings");
    })
);

//search
router.get("/", async (req, res) => {
  let { q } = req.query;

  let allListings = [];

  if (q) {
    allListings = await Listing.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } }
      ]
    });
  } else {
    allListings = await Listing.find({});
  }

  res.render("listings/index.ejs", { allListings, q });
});

module.exports = router;