const multer = require("multer");
const multerError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "File size limit exceeded. Max allowed size: 1MB." });
    } else {
      return res
        .status(400)
        .json({ error: "File upload error: " + err.message });
    }
  } else {
    console.error(err); // Log the error for debugging
    res.status(500).json({ error: "An error occurred." });
  }
};
module.exports = multerError;

