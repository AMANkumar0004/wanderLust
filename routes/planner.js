const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware.js");
const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Itinerary = require("../models/itinerary.js");

// Add to Favorites
router.post("/favorites/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let user = await User.findById(req.user._id);
    if (!user.favorites.includes(id)) {
        user.favorites.push(id);
        await user.save();
        req.flash("success", "Added to favorites!");
    } else {
        req.flash("error", "Already in favorites!");
    }
    res.redirect(`/listings/${id}`);
}));

// Remove from Favorites
router.delete("/favorites/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await User.findByIdAndUpdate(req.user._id, { $pull: { favorites: id } });
    req.flash("success", "Removed from favorites!");
    res.redirect("/planner/dashboard");
}));

// User Dashboard
router.get("/dashboard", isLoggedIn, wrapAsync(async (req, res) => {
    let user = await User.findById(req.user._id).populate("favorites");
    // Filter out any favorites that might have been deleted from the database
    user.favorites = user.favorites.filter(fav => fav != null);

    let itineraries = await Itinerary.find({ user: req.user._id }).populate("items.listing");
    res.render("planner/dashboard.ejs", { user, itineraries });
}));

// Create Itinerary Page
router.get("/itinerary/new", isLoggedIn, wrapAsync(async (req, res) => {
    let user = await User.findById(req.user._id).populate("favorites");
    res.render("planner/new_itinerary.ejs", { user });
}));

// Save Itinerary
router.post("/itinerary", isLoggedIn, wrapAsync(async (req, res) => {
    let { title, items } = req.body;
    let newItinerary = new Itinerary({
        title,
        user: req.user._id,
        items: items.filter(item => item.listing) // Filter out empty items
    });
    await newItinerary.save();
    req.flash("success", "Itinerary created!");
    res.redirect("/planner/dashboard");
}));

// View/Edit Itinerary
router.get("/itinerary/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let itinerary = await Itinerary.findById(id).populate("items.listing");
    let user = await User.findById(req.user._id).populate("favorites");
    res.render("planner/edit_itinerary.ejs", { itinerary, user });
}));

// Update Itinerary
router.put("/itinerary/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let { title, items } = req.body;
    await Itinerary.findByIdAndUpdate(id, {
        title,
        items: items.filter(item => item.listing)
    });
    req.flash("success", "Itinerary updated!");
    res.redirect("/planner/dashboard");
}));

// Delete Itinerary
router.delete("/itinerary/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Itinerary.findByIdAndDelete(id);
    req.flash("success", "Itinerary deleted!");
    res.redirect("/planner/dashboard");
}));

module.exports = router;
