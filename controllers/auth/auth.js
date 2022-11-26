const { User } = require("../../models/user");
const { Conflict, Unauthorized, NotFound, BadRequest } = require("http-errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { nanoid } = require("nanoid");
const nodemailer = require("nodemailer");
require("dotenv").config();

const { JWT_SECRET, META_PASSWORD } = process.env;

async function sendRegisterEmail({ email, token }) {
  const transport = nodemailer.createTransport({
    host: "smtp.meta.ua",
    port: 465,
    auth: {
      user: "the_sneg@meta.ua",
      pass: META_PASSWORD,
    },
  });

  const url = `<a target="_blank" href="http://localhost:3000/api/auth/verify/${token}>to verify your email</a>`;

  const emailBody = {
    from: "the_sneg@meta.ua",
    to: email,
    subject: "Please verify your email",
    html: `<div>Please open this link:</div> ${url} `,
    text: `Please open this link: ${url} to verify your email`,
  };

  const response = await transport.sendMail(emailBody);
  console.log("Email sent", response);
}

async function verifyEmail(req, res, next) {
  const { token } = req.params;

  const user = await User.findOne({
    verifyToken: token,
  });

  // no user
  if (!user) {
    throw new NotFound("No user found");
  }

  // user exists, not verified
  if (!user.isVerified) {
    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      verifyToken: null,
    });
    return res.json({
      message: "Email has been successfully verified",
    });
  }

  // user exists, verified
  if (user.isVerified) {
    return res.json({
      message: "Your Email already verified",
    });
  }
}

async function recent(req, res, next) {
  const { email } = req.body;
  if (!email) {
    throw BadRequest("Missing required field email");
  }
  const user = await User.findOne({ email });

  if (!user || user.isVerified) {
    return res.json({
      message: "Verification has already been passed",
    });
  }

  await sendRegisterEmail({ email, token: user.verifyToken });

  console.log(user.verifyToken);
  res.status(200).json({
    message: "Verification email sent",
  });
}

async function register(req, res, next) {
  const { email, password } = req.body;

  const verifyToken = nanoid();

  const avatarURL = gravatar.url(email);

  const user = new User({ email, password, avatarURL, verifyToken });
  try {
    await user.save();
    await sendRegisterEmail({ email, token: verifyToken });
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

  if (!user.isVerified) {
    throw new Unauthorized("Email is not verified");
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
  verifyEmail,
  recent,
};
