const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { handleSaveError } = require("../middelwares");

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false }
);

contactSchema.post("save", handleSaveError);

const addSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
});

const updateScema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
}).min(1);

const updateFavoriteShema = Joi.object({
  favorite: Joi.boolean().required(),
});

const subscriptionSchema = Joi.object({
  subscription: Joi.string().required(),
});

const schemas = {
  addSchema,
  updateScema,
  updateFavoriteShema,
  subscriptionSchema,
};

const Contact = model("contact", contactSchema);

module.exports = {
  Contact,
  schemas,
};
