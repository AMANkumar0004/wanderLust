const { ref } = require("joi");
const mongoose = require("mongoose");
const Review = require("./review.js");

const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    maxGuests: {
        type: Number,
        default: 1,
        min: 1,
    },
    location: String,
    country: String,
    },
    description: String,

    // main thumbnail
    image: {
        url: String,
        filename: String,
    },

    // multiple images
    images: [
        {
            url: String,
            filename: String,
        }
    ],

    price: Number,

    maxGuests: {
        type: Number,
        default: 1,
        min: 1,
    },

    location: String,
    country: String,

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }

    },
    category: {
        type: String,
        enum: ["mountains", "arctic", "farms", "rooms", "cities", "castles", "pools", "camping", "beach", "trending"]
    },
})

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } })
    }

})

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },

    category: {
        type: String,
        enum: [
            "mountains",
            "arctic",
            "farms",
            "rooms",
            "cities",
            "castles",
            "pools",
            "camping",
            "beach",
            "trending"
        ]
    }
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;