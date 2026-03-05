const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
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
  let originalImages = images.map(img => ({
    ...img,
    url: img.url.replace("/upload", "/upload/h_300,w_250")
  }));
  res.render("listings/edit.ejs", { listing, originalImages });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
    listing.images.push(...newImages);
    // Update the single image field for backward compatibility if it's not set
    if (!listing.image || !listing.image.url) {
      listing.image = newImages[0];
    }
    await listing.save();
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