const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().min(3).required(),

    description: Joi.string().allow("", null),

    price: Joi.number().min(0).required(),

    location: Joi.string().allow("", null),

    country: Joi.string().allow("", null),

    image: Joi.string().allow("", null)
  }).required()
});