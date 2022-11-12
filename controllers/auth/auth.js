const { User } = require("../../models/user");
const { Conflict, Unauthorized } = require("http-errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { JWT_SECRET } = process.env;

async function register(req, res, next) {
  const { email, password } = req.body;

  const user = new User({ email, password });
  try {
    await user.save();
  } catch (error) {
    if (error.message.includes("duplicate key error collection")) {
      throw new Conflict("User with this email already registered");
    }

    throw error;
  }

  return res.status(201).json({
    data: {
      user: {
        _id: user._id,
      },
    },
  });
}

async function login(req, res, next) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new Unauthorized("User does not exists");
  }
  const isPasswordTheSame = await bcrypt.compare(password, user.password);
  if (!isPasswordTheSame) {
    throw new Unauthorized("wrong password");
  }

  const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
    expiresIn: "15m",
  });

  user.token = token;
  await User.findByIdAndUpdate(user._id, user);

  return res.json({
    data: {
      token,
    },
  });
}

async function logout(req, res, next) {
  console.log("logout");
  const { user } = req;
  user.token = null;
  await User.findByIdAndUpdate(user._id, user);

  return res.json({});
}

module.exports = {
  register,
  login,
  logout,
};
