const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itinerarySchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [{
        listing: {
            type: Schema.Types.ObjectId,
            ref: "Listing",
        },
        day: {
            type: Number,
            default: 1,
        },
        notes: {
            type: String,
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Itinerary", itinerarySchema);
