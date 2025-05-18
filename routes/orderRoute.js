const express = require("express");

const {
  authMiddleware,
  isAdmin,
} = require("../middlewares/authMiddleware");
const { getAllOrders,deleteOrder,createOrder, getInvoiceByNo ,getInvoices,editOrderStatus ,getSingleOrder} = require("../controller/orderCtrl");

const router = express.Router();
router.get("/", getAllOrders); 
router.post("/create-order", createOrder); 
router.post("/getaOrder/:id", authMiddleware, getSingleOrder); 
router.delete("/:id", authMiddleware, isAdmin, deleteOrder)
router.get("/invoice",authMiddleware, getInvoices);
router.get("/invoice/:id",authMiddleware,isAdmin, getInvoiceByNo);
// router.get("/admin",authMiddleware,isAdmin, getAdminProduct);
router.put("/edit",authMiddleware,isAdmin, editOrderStatus);
module.exports = router;
