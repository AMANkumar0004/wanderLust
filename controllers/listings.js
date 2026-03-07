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