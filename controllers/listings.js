const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });
module.exports.createListing = async (req, res, next) => {

  let geometry = { type: "Point", coordinates: [0, 0] };

  // Get coordinates from Mapbox
  if (geocodingClient) {
    try {
      let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      }).send();

      if (response.body.features.length > 0) {
        geometry = response.body.features[0].geometry;
      }
    } catch (err) {
      console.log("Geocoding error:", err.message);
    }
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  // Handle image uploads
  if (req.files && req.files.length > 0) {
    newListing.images = req.files.map(f => ({
      url: f.path,
      filename: f.filename
    }));

    // set thumbnail
    newListing.image = newListing.images[0];
  }

  newListing.geometry = geometry;

  const savedListing = await newListing.save();
  console.log(savedListing);

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListings = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/edit.ejs", {  listing, originalImages: listing.images || [] });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(f => ({
      url: f.path,
      filename: f.filename
    }));
    listing.images.push(...newImages);
    if (!listing.image) {
      listing.image = listing.images[0];
    }
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};