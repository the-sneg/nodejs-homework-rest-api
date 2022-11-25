const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    contacts: [
      {
        type: Schema.Types.ObjectId,
        ref: "contact",
      },
    ],
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
    },
    avatarURL: {
      type: String,
      required: true,
    },

    verifyToken: {
      type: String, // token to verify email
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) next();

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(user.password, salt);
  user.password = hashedPassword;
  next();
});

const User = model("user", userSchema);

module.exports = {
  User,
};
