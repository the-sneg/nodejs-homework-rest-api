const fs = require("fs/promises");
const path = require("path");
const { Contact } = require("../../models/contact");

async function changeImageUrl(req, res, next) {
  // 1 - save file in public/images
  console.log(req.file);
  const newPath = path.join(
    __dirname,
    "../../public/avatars",
    req.file.filename
  );
  await fs.rename(req.file.path, newPath);

  // 2
  const contactId = req.params.id;
  console.log(req.params.id);
  const contactImage = "/public/images/" + req.file.filename;

  const savedContact = await Contact.findByIdAndUpdate(
    contactId,
    {
      image: contactImage,
    },
    { new: true }
  );

  return res.status(201).json({ data: { movie: savedContact } });
}

module.exports = changeImageUrl;
