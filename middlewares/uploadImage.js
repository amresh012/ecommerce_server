const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + uniqueSuffix + "." + file.originalname.split(".").pop()
    );
  },
});
const url = "http://127.0.0.1:8032";


const uploadPhoto = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // 3MB size limit
  },
});

const uploadImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }
    const urls = req.files.map((itm) => `${url}/upload/${itm.filename}`);
    res.json(urls);
  } catch (error) {
    console.error("Error during file upload:", error);
    res.status(500).json({ error: "An error occurred during file upload." });
  }
};

module.exports = { uploadPhoto,  uploadImage };
