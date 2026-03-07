const Booking = require("../models/booking");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

// POST /listings/:id/bookings
module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    if (listing.owner.equals(req.user._id)) {
        req.flash("error", "You cannot book your own listing.");
        return res.redirect(`/listings/${id}`);
    }

    const { checkIn, checkOut, guests } = req.body.booking;

    const numGuests = parseInt(guests);
    const maxGuests = listing.maxGuests || 1;

    // Validate guest count
    if (numGuests > maxGuests) {
        req.flash("error", `This listing allows a maximum of ${maxGuests} guest(s). You requested ${numGuests}.`);
        return res.redirect(`/listings/${id}`);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
        req.flash("error", "Check-out date must be after check-in date.");
        return res.redirect(`/listings/${id}`);
    }

    // Calculate number of nights
    const msPerDay = 1000 * 60 * 60 * 24;
    const numberOfNights = Math.ceil((checkOutDate - checkInDate) / msPerDay);

    // Total price = basePrice * guests * numberOfNights
    const totalPrice = listing.price * numGuests * numberOfNights;

    const newBooking = new Booking({
        listing: listing._id,
        user: req.user._id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: numGuests,
        totalPrice,
    });

    await newBooking.save();

    req.flash(
        "success",
        `Booking confirmed! ${numGuests} guest(s) × ${numberOfNights} night(s) = ₹${totalPrice.toLocaleString("en-IN")}`
    );
    res.redirect(`/listings/${id}`);
};

// GET /listings/:id/bookings — show booking history for a listing (owner only)
module.exports.listBookings = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not authorized to view bookings for this listing");
        return res.redirect(`/listings/${id}`);
    }

    const bookings = await Booking.find({ listing: id }).populate("user");
    res.render("listings/bookings.ejs", { listing, bookings });
};
