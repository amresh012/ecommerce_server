const express = require("express");
const { getAdminData } = require("../controller/adminCtrl");
const { authMiddleware, isAdmin, checkAccess } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware,checkAccess, getAdminData);

module.exports = router;
