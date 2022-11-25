const express = require("express");
const usersController = require("../../controllers/user/user");

const { tryCatchWrapper } = require("../../helpers/index");
const { validateBody } = require("../../middelwares");
const { auth } = require("../../middelwares/auth");
const { schemas } = require("../../models/contact");
const { upload } = require("../../middelwares/uploadFile");
const usersRouter = express.Router();
const { subscriptionSchema } = schemas;

const validateSubscription = validateBody(subscriptionSchema);

usersRouter.get(
  "/contacts",
  tryCatchWrapper(auth),
  tryCatchWrapper(usersController.getContacts)
);
usersRouter.post(
  "/contacts",
  tryCatchWrapper(auth),
  tryCatchWrapper(usersController.createContact)
);

usersRouter.get(
  "/current",
  tryCatchWrapper(auth),
  tryCatchWrapper(usersController.current)
);
usersRouter.patch(
  "/:userId/subscription",
  validateSubscription,
  tryCatchWrapper(usersController.updateSubscription)
);

usersRouter.patch(
  "/avatars",
  tryCatchWrapper(auth),
  tryCatchWrapper(upload.single("avatar")), // save it tmp directory
  tryCatchWrapper(usersController.changeImageUrl)
);

module.exports = {
  usersRouter,
};
