const express = require("express");
const multer = require("multer");

const {
  addProduct,
  getallProduct,
  deleteProduct,
  searchProduct,
  getProductById,
  updateproduct,
  uploadBulkProduct,
} = require("../controller/productctrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
// const {generateProductDescription} = require("../controller/generateWithAiCtrl")

const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage });

const router = express.Router();
router.post("/add", addProduct);
router.get("/:id", getProductById);
router.get("/", getallProduct, searchProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.post("/update", updateproduct);
router.post("/bulk", upload.single("excelFile"), uploadBulkProduct);
// router.post('/generate-product-description',generateProductDescription);

module.exports = router;
