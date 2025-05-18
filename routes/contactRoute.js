const express = require("express");
const {
  addContactus,
  getallContactUs,
  deleteContact,
  updateRemarkContact,
  contactDetails,
} = require("../controller/contactusCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();
router.get("/", getallContactUs);
router.post("/", addContactus);
router.put("/", updateRemarkContact);
router.delete("/:id", authMiddleware, isAdmin, deleteContact);
router.get("/:id", authMiddleware, isAdmin, contactDetails);
module.exports = router;
