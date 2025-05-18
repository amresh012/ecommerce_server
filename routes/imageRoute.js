const express = require("express");
const { addimage, getImg,deleteImage } = require("../controller/imgCtrl");
const {authMiddleware,checkAccess} = require("../middlewares/authMiddleware")


const router = express.Router();
router.get("/", getImg);
router.post("/", addimage);
router.delete("/:id", deleteImage);
module.exports = router;
