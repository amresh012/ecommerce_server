const Product = require("../models/productModel");
const Adress = require("../models/addressModel");
const axios = require("axios");
const User = require("../models/userModel");

const createOrder = async (req, res) => {
  const {addr,productinfo, email} = req.body
  const useremail = req.body.email;
  const userD = await User.find({ email: useremail });
  const user = userD[0];
 
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  // Extracted id from body
  const productids = req.body.productinfo.split(" ");
  const extractedIds = [];
  for (let i = 0; i < productids.length; i++) {
    const word = productids[i].trim(); // Remove any leading/trailing spaces from the word
    if (word.length === 24) {
      extractedIds.push(word);
    }
  }
  // Getting product details
  const productDetail = [];
  for (let i = 0; i < extractedIds.length; i++) {
    const element = await Product.find({ _id: extractedIds[i] });
    const product = element[0];
    let pro = {
      name: product.name,
      sku: product.sku,
      units: product.quantity,
      length:product.length,
      width: product.width,
      height: product.height,
      weight:product.weight,
      selling_price: product.price,
        // discount: product.Discount,
    };
    productDetail.push(pro);
  }
  // getting user adress
  const n = user.address.length - 1
  const addid = user.address[n];
  const adr = await Adress.findOne({ _id: addid });
  function generateSixDigitRandomNumber() {
    // Generate a random number between 100000 and 999999 (both inclusive)
    const randomNumber = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    return randomNumber;
  }
  
  const orderid = generateSixDigitRandomNumber();
  const amount = req.body.amount;
  const shiprocket = {
    order_id: orderid.toString(),
    order_date: new Date().toISOString().split("/")[0],
    pickup_location: "Primary",
    billing_customer_name: addr.name,
    billing_last_name: addr?.name,
    billing_address: addr?.address,
    billing_city:addr?.city,
    billing_pincode: addr?.zipcode,
    billing_state:addr?.state,
    billing_country: "India",
    billing_email: useremail,
    billing_phone: addr?.mobile,
    shipping_is_billing: true,
    order_items: productDetail,
    payment_method: "Prepaid",
    transaction_charges: 0,
    total_discount: 0,
    sub_total: amount,
    length: 10,
    breadth: 15,
    height: 20,
    weight: 2.5,
  };
  const headersConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.SHIP_ROCKET_TOKEN,
    },
  };

  try {
    const resp = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      shiprocket,
      headersConfig
    );
    if (resp.data.error) {
     return res.status(500).send({ message:resp.data.error });
    } else {
      // makepdf(useremail)
      return res.json({success:true,shippting:resp.data});
    }
  } catch (error) {
    const shiprocketerr = error.response?.data?.errors
    if(shiprocketerr){
      console.error("Error making API request:", shiprocketerr);
     return res.status(500).send(shiprocketerr);
    }
    else{
     return res.status(500).send(error);
    }
  }
};


const base_url = 'https://apiv2.shiprocket.in/v1/external/';


// shipment logic
const generateShipmentForOrder = async (req, res) => {
  const {shipment_id,courier_id, status} = req.body
  try {
    const response = await axios.post(`${base_url}courier/assign/awb`,{shipment_id,courier_id, status},
      {
        "Content-Type": "application/json",
        Authorization: process.env.SHIP_ROCKET_TOKEN,
      }
    );
    if (response.data.status === 1) {
      return {
        success: true,
        // shipment_id: response.data.shipment_id,
        awb_code: response.data.awb_code,
        message: 'Shipment created successfully'
      };
    } else {
      return {
        success: false,
        message: 'Shipment creation failed',
        details: response.data
      };
      // throw new Error('Error generating shipment: ' + error.message);
    }
  } catch (error) {
  }
};


// tracking logic
const trackOrderByAWB = async (req,res) => {
  try {
    const token = await getShiprocketToken();
    const response = await axios.get(`${base_url}courier/track/awb/${awb_code}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.tracking_data) {
      return {
        success: true,
        tracking_info: response.data.tracking_data,
        message: 'Tracking information retrieved successfully'
      };
    } else {
      return {
        success: false,
        message: 'Tracking information not found',
        details: response.data
      };
    }
  } catch (error) {
    throw new Error('Error tracking order: ' + error.message);
  }
};



module.exports = {
  createOrder,
  generateShipmentForOrder,
  trackOrderByAWB
};














// channel 882557