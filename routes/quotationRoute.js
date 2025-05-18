const express = require("express");
const {
addquote,getallQuote,deleteQuote,updateQuote,QuotationDetails
} = require("../controller/quoteCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();
router.get("/", getallQuote);
router.post("/", addquote);
router.put("/", updateQuote);
router.delete("/:id", authMiddleware, isAdmin, deleteQuote);
router.get("/:id", authMiddleware, isAdmin, QuotationDetails);
module.exports = router;
