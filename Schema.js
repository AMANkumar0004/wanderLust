const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),

        // multiple images
        images: Joi.array().items(
            Joi.object({
                url: Joi.string(),
                filename: Joi.string()
            })
        ).optional(),

        // single image (optional)
        image: Joi.string().allow("", null),

        category: Joi.string()
            .valid(
                "mountains",
                "arctic",
                "farms",
                "rooms",
                "trending",
                "cities",
                "castles",
                "pools",
                "camping",
                "beach"
            )
            .required(),

        maxGuests: Joi.number().integer().min(1).optional()
    }).required(),

    deleteImages: Joi.array().items(Joi.string().allow("")).optional()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().required()
    }).required()
});

module.exports.bookingSchema = Joi.object({
    booking: Joi.object({
        checkIn: Joi.date().required(),
        checkOut: Joi.date().greater(Joi.ref("checkIn")).required(),
        guests: Joi.number().integer().min(1).required()
    }).required()
});