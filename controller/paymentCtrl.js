const crypto =require("crypto")
const CouponCodes = require("../models/discountModel");
const User =require("../models/userModel");
const Razorpay =require("razorpay");
const orderModel = require("../models/orderModel");
const OrderController = require("../controller/orderCtrl")

// gernerating unique id's
function generateId() {
  const timestamp = new Date().getTime();
  const randomId = Math.floor(Math.random() * 1000000);
  const uniqueTransactionId = `MT${timestamp}${randomId}`;
  return uniqueTransactionId;
}

const razorpay = new Razorpay({
  key_id:process.env.RAZORPAY_KEY_ID,
  key_secret:process.env.RAZORPAY_SECRET_KEY,
});

const createOrder = async (req, res) => {
  try {
    const {amount , cartItems , address , userId} = req.body;
    
    const options = {
      amount: amount *100  , // amount in the smallest currency unit
      currency: "INR",
      receipt: generateId(),
      notes:{
        "shipping_info":address
      }
    }
    // 
    const order = await razorpay.orders.create(options);
    // 
    if (!order) {
      return res.status(500).send("Failed to create Order");
    }
   const respo =  res.json({
      orderId:order.id,
      amount : amount,
      cartItems,
      address,
      paystatus:"Created"
    });
    return respo;
      } 
  catch (err) {
    
    return res.status(500).send("Failed To Create Order");
  }
};

const verifyPayment = async (req, res) => {
  const { paymentId,order_id, razorpay_signature, amount, items, address, user } = req.body;
  const key_secret = process.env.RAZORPAY_SECRET_KEY;
  // Prepare the string that needs to be signed
  const body = order_id+"|"+paymentId;
  // Generate the expected signature
  const expectedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(body.toString())
    .digest("hex");
  const isAuthentic = expectedSignature === razorpay_signature;
  if (isAuthentic) {
    return res.status(200).json({
      success:true,
      message: "Payment Verification is successful",

    })
  } else {
    return res.status(400).json({
      success:false,
      message: "Payment verification failed",
    });
  }
};




module.exports={
  createOrder,
  verifyPayment,
}
