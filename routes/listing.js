const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const{listingSchema}= require("../Schema.js");
const Listing = require("../models/listing.js");
const passport = require("passport");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js")
const listingController = require("../controllers/listings.js")
const multer  = require('multer')
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage})

router.route("/")
.get(wrapAsync(listingController.index))
.post( isLoggedIn,
  upload.single('listing[image]'),
  validateListing,
 wrapAsync(listingController.createListing));


// NEW ROUTE
  router.get("/new",isLoggedIn,wrapAsync(listingController.renderNewForm));

router.route("/:id")
.get(wrapAsync( listingController.showListings))
.delete(isLoggedIn,isOwner,wrapAsync( listingController.destroyListing))
.put(isLoggedIn,
  isOwner,
  upload.single('listing[image]'),
  validateListing, wrapAsync( listingController.updateListing));

 //Edit Route
  router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm ));
  
 module.exports=router;