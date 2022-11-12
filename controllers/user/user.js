const { User } = require("../../models/user");
const { RequestError } = require("../../helpers/RequstError");
const { User: UserModel } = require("../../models/user");

async function getContacts(req, res, next) {
  const { user } = req;

  const contacts = await UserModel.findOne(user._id).populate("contacts", {
    name: 1,
    datePublished: 1,
    _id: 1,
  });

  return res.status(200).json({
    data: {
      contacts,
    },
  });
}

async function createContact(req, res, next) {
  const { _id } = req.body; // contact id
  const { user } = req;

  user.contacts.push({
    _id,
  });

  await UserModel.findByIdAndUpdate(user._id, user);

  return res.status(201).json({
    data: {
      contacts: user.contacts,
    },
  });
}
async function current(req, res) {
  const { email, subscription } = req.user;
  res.json({ email, subscription });
}

async function updateSubscription(req, res, next) {
  const { userId } = req.params;
  const { subscription } = req.body;

  const updatedSubscription = await User.findByIdAndUpdate(
    userId,
    { subscription },
    {
      new: true,
    }
  );
  if (!updatedSubscription) {
    throw RequestError(404, "Not found2");
  }
  res.json(updatedSubscription);
}

module.exports = {
  getContacts,
  createContact,
  current,
  updateSubscription,
};
