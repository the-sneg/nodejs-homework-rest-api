const express = require("express");
const authController = require("../../controllers/auth/auth");
const { tryCatchWrapper } = require("../../helpers/index");
const { auth } = require("../../middelwares/auth");

const authRouter = express.Router();

authRouter.post("/register", tryCatchWrapper(authController.register));
authRouter.post("/login", tryCatchWrapper(authController.login));
authRouter.get("/verify/:token", tryCatchWrapper(authController.verifyEmail));
authRouter.post(
  "/logout",
  tryCatchWrapper(auth),
  tryCatchWrapper(authController.logout)
);

module.exports = {
  authRouter,
};
