const express = require("express");

const { authMiddleware } = require("../middlewares/authMiddleware");
const { createOrder,generateShipmentForOrder , trackOrderByAWB } = require("../controller/shiprocketctrl");
const shiprocketController = require('../controller/ShippingCalaulator');
const router = express.Router();

router.post("/",authMiddleware , createOrder );
router.post('/shiprocket-rate-calculation',authMiddleware, shiprocketController.shiprocketRateCalculation);
router.post('/CreateShipment',authMiddleware, generateShipmentForOrder);
router.post('/trackOrder',authMiddleware,trackOrderByAWB);

module.exports = router;
