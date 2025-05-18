const express = require("express");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const {
  uploadPhoto,
  uploadImage,
} = require("../middlewares/uploadImage");
const multerError = require("../middlewares/multererror");
const router = express.Router();

router.post(
  "/",
  uploadPhoto.array("file", 10),
  multerError,
  uploadImage
);

module.exports = router;
