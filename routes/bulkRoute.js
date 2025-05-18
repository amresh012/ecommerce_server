const express = require("express");
const {
  addBulk,
  getallBulk,
  deletebulk,
  updateRemarkbulk,
} = require("../controller/bulkCtrl");
const {authMiddleware , isAdmin} = require("../middlewares/authMiddleware")

const router = express.Router();
router.get("/", getallBulk);
router.post("/addbulk",authMiddleware , isAdmin, addBulk);
router.put("/updateremark",updateRemarkbulk);
router.delete("/deletebulk",authMiddleware , isAdmin, deletebulk);
module.exports = router;
