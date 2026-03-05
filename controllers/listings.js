const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { cloudinary } = require("../cloudConfig.js");
const mapToken = process.env.MAP_TOKEN;
let geocodingClient;

if (mapToken && mapToken !== "your_mapbox_token") {
  geocodingClient = mbxGeocoding({ accessToken: mapToken });
}

module.exports.index = async (req, res) => {
  const { category, search } = req.query;
  let queryObj = {};

  if (category && category !== 'all') {
    queryObj.category = category.toLowerCase();
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    if (Object.keys(queryObj).length) {
      queryObj.$and = [{
        $or: [
          { title: searchRegex },
          { location: searchRegex },
          { description: searchRegex },
        ]
      }];
    } else {
      queryObj.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { description: searchRegex },
      ];
    }
  }


  const allListings = await Listing.find(queryObj);
  res.render("listings/index.ejs", { allListings, category, search });
};



module.exports.renderNewForm = async (req, res) => {
  // console.log(req.user);
  res.render("listings/new.ejs");
};

module.exports.showListings = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let geometry = { type: 'Point', coordinates: [0, 0] };
  if (geocodingClient) {
    try {
      let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      }).send();
      if (response.body.features && response.body.features.length > 0) {
        geometry = response.body.features[0].geometry;
      }
    } catch (e) {
      console.error("Geocoding error:", e.message);
    }
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  if (req.files) {
    newListing.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    if (newListing.images.length > 0) {
      newListing.image = newListing.images[0];
    }
  }

  newListing.geometry = geometry;
  let savedListing = await newListing.save();
  console.log(savedListing);

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    res.redirect("/listings");
  }
  let images = listing.images && listing.images.length > 0 ? listing.images : (listing.image ? [listing.image] : []);
  // Explicitly map properties — spread on Mongoose subdocuments misses getter-backed fields like filename
  let originalImages = images.map(img => ({
    url: img.url ? img.url.replace("/upload", "/upload/h_300,w_250") : '',
    filename: img.filename || ''
  }));
  console.log("[Edit] originalImages filenames:", originalImages.map(i => i.filename));
  res.render("listings/edit.ejs", { listing, originalImages });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  console.log("[Update] deleteImages received:", req.body.deleteImages);
  // Update basic fields (title, description, price, etc.)
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

  // 1. Delete images marked for removal
  if (req.body.deleteImages) {
    const toDelete = (Array.isArray(req.body.deleteImages)
      ? req.body.deleteImages
      : [req.body.deleteImages]).filter(Boolean); // strip empty strings (legacy images with no filename)

    if (toDelete.length > 0) {
      // Delete each from Cloudinary
      for (let filename of toDelete) {
        try {
          await cloudinary.uploader.destroy(filename);
        } catch (e) {
          console.error("Cloudinary delete error:", e.message);
        }
      }

      // Remove from DB using $pull (reliable — bypasses mongoose change tracking)
      await Listing.findByIdAndUpdate(id, {
        $pull: { images: { filename: { $in: toDelete } } }
      });

      // Re-fetch after $pull to get fresh state
      listing = await Listing.findById(id);

      // Fix primary thumbnail if it was deleted
      if (listing.image && toDelete.includes(listing.image.filename)) {
        listing.image = listing.images.length > 0 ? listing.images[0] : { url: "", filename: "" };
        listing.markModified('image');
        await listing.save();
      }
    }
  }

  // 2. Add newly uploaded images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await Listing.findByIdAndUpdate(id, {
      $push: { images: { $each: newImages } }
    });
    // Set thumbnail if none exists
    listing = await Listing.findById(id);
    if (!listing.image || !listing.image.url) {
      listing.image = newImages[0];
      listing.markModified('image');
      await listing.save();
    }
  }

  req.flash("success", "Listing Updated Successfully");
  res.redirect(`/listings/${id}`);
};



module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};