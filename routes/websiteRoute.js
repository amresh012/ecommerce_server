const express = require("express");
const { updateConfig, getConfig } = require("../controller/websiteCtrl");
const {
  authMiddleware,
  isAdmin,
  isSuper,
} = require("../middlewares/authMiddleware");

const router = express.Router();
router.get("/", getConfig);
router.post("/",authMiddleware, isAdmin, updateConfig);// , add these here
module.exports = router;
