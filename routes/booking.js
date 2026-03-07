const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams so :id is accessible
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateBooking } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");

// POST /listings/:id/bookings — create a booking
router.post("/", isLoggedIn, validateBooking, wrapAsync(bookingController.createBooking));

// GET /listings/:id/bookings — list all bookings (owner only)
router.get("/", isLoggedIn, wrapAsync(bookingController.listBookings));

module.exports = router;
