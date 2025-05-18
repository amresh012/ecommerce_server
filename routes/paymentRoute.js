const express = require ("express")
const router = express.Router()
const {authMiddleware} = require("../middlewares/authMiddleware")

const {createOrder, verifyPayment ,applyCode}  = require("../controller/paymentCtrl")

router.post("/createOrder" ,authMiddleware, createOrder)
router.post("/verifyPayment" , verifyPayment)

module.exports = router;


