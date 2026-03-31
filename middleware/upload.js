const multer = require("multer");
const { storage } = require("../cloudConfig"); // 👈 tera cloudinary config

const upload = multer({ storage });

module.exports = upload;