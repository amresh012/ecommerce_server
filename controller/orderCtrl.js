const Order =  require("../models/orderModel")
const User = require("../models/userModel")
const Product = require("../models/productModel")
const InvoiceModel = require("../models/invoiceModel")
const { sendEmail } = require("./emailCtrl");
const invoice = require("./invoiceCtrl");


// CREATE ORDER
function generateId() {
  const timestamp = new Date().getTime();
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000); // Random 8-digit number
  const orderId = `${timestamp}${randomDigits}`.substring(0, 8);
  return orderId;
}

const createOrder = async (req, res,) => {
  const { datatosend } = req.body;
  const user = datatosend.user ;
  let address = datatosend.address
  let transactionId =  datatosend.paymentId;
  let orderId = datatosend.order_id
  let amount = datatosend.amount
  let adr, placeofsup, gstNo;
  
  for (let i = 0; i < user.address.length; i++) {
    if (JSON.stringify(user.address[i]._id) == JSON.stringify(address)) {
      adr = `${user.address[i].adr} , ${user.address[i].city} , ${user.address[i].state} - ${user.address[i].pincode}`
      placeofsup = user.address[i].city
      gstNo = user.address[i].gstNo
    }
  }
  let totalValue = parseInt(user.cart.totalValue);
  let isCoupon = false;
  
  if (user.cart?.products?.length > 0) {
    if (user.cart.isCouponApplied?.code) {
      isCoupon = {
        code: user.cart.isCouponApplied.code,
        discountrs: parseInt(user.cart.isCouponApplied.discountValue),
      };
    }
    const newOrder = {
      products: user.cart.products,
      total: amount,
      order_id: orderId,
      users: user._id,
      address: address,
      transactionId: transactionId || generateId(),
      invoiceNo: generateId(),
    };
    const createdOrder = await Order.create(newOrder);
    const orders = await Order.find({ _id: createdOrder._id }).populate("products.product");
    
    const orderArr = orders.map((order) => ({
      transactionId: order.transactionId,
      products: order.products.map((product) => {
        return {
          name: product.product.name,
          image: product.product.images,
          count: product.count,
          total: product.total,
          price: product.product.total,
          hsn: product.product.hsnCode,
          unit: product.product.measurment,
        };
      }),
      total: order.total,
      status: order.status,
    }));

    const detail = {
            invoiceno: newOrder.invoiceNo,
            userName: user.name,
            userAdress: adr,
            totalPrice: totalValue,
            productDetails: orderArr[0].products,
            isCoupon,
            placeofsup,
            gstNo
          };
          const invoiced = {
            invoiceNo: newOrder.invoiceNo,
            products:orderArr[0].products,
            invoice: invoice(detail),
            total: orderArr[0].total,
            orderd_by: user._id,
          };
          await InvoiceModel.create(invoiced);

    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $push: { order: createdOrder._id },
        $set: {
          "cart.products": [],
          "cart.totalValue": 0,
        },
        $unset: { "cart.isCouponApplied": "" }
      },
      { new: true }
    )
    // order confirmation mail

    let orderItemsHTML = user.cart.products.map(product => {
      return `
      <tr>
          <td>${product.name}</td>
          <td>${product.count}</td>
          <td>${product.total}</td>
      </tr>`;
  }).join('');

    const sendData = 
    `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f6f6f6;
        }
        .container {
            width: 80%;
            margin: 0 auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px;
            background-color: #007bff;
            color: white;
            border-radius: 8px 8px 0 0;
        }
        .header h1 {
            margin: 0;
        }
        .content {
            padding: 20px;
        }
        .order-details {
            margin: 20px 0;
        }
        .order-details h2 {
            margin-bottom: 10px;
        }
        .order-details table {
            width: 100%;
            border-collapse: collapse;
        }
        .order-details th, .order-details td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #dddddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmation</h1>
        </div>
        <div class="content">
            <h2>Dear ${user.name},</h2>
            <p>Thank you for your order! We're excited to let you know that your order has been confirmed.</p>
            <p>Your Total ${user?.cart?.products?.length} item(s) will be deliverd soon</p>
            <p><strong>Total Amount(including all taxes): ${amount}</strong></p>
            <p>Your order will be shipped to:</p>
            <div>
             <p>${address?.address}</p>
             <p>${address?.state}</p>
             <p>${address?.city}</p>
             <p>${address?.zipcode}</p>
            </div>
        </div>
        <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>&copy; ${new Date().getFullYear()} KFS FITNESS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
    const data = {
      to: user?.email,
      subject:  `Thank You ${user.name}-Purchase Successful!`,
      html: sendData,
    };
    sendEmail(data);
    // order confirmation mail end
    res.json(createdOrder);
  } else {
    res.status(500).send({ error: "No product found in user cart" });
  }
};

  // get All Orders
  const getAllOrders = async (req, res) => {
    try {
      // Fetch all orders from the database
      const orders = await Order.find().populate({
        path: "users",
        model: "User",
        select:"name address "
      }).populate("products.product")
      .populate("address")

      // Send the orders as the response
      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      
      // Send an error response
      res.status(500).json({
        success: false,
        message: "Error fetching orders",
        error: error.message,
      });
    }
  };

  const deleteOrder = async (req, res) => {
    try {
      // Get the order id from the request parameters
      const id = req.params.id;
  
      // Find and remove the order by its id
      const order = await Order.deleteOne({ _id: id });
      
      // If the order is not found, return a 404 error
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
  
      // Find and remove the associated invoice
      await InvoiceModel.deleteOne({ orderId: id });
  
      // Return a success message
      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      // Log the error and return a 500 error
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };


  // getSingleOrder
const getSingleOrder = async (req, res) => {
  try {
    // Extract the order ID from the request parameters
    const { id } = req.params;

    // Find the order by ID and populate related data (like products and invoice)
    const order = await Order.findById(id)

    // Check if the order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Send the order data as a response
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    // Handle any errors during the process
    console.error("Error fetching the order:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the order",
      error: error.message,
    });
  }
};


  // edit order status
  const editOrderStatus = async (req, res) => {
    try {
      const { status, invoiceNo } = req.body;
      const order = await Order.findOneAndUpdate(
        { invoiceNo },
        { status }, // Update the status field
        { new: true } // Return the updated document
      );
    
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
  
      res.json({success:true, message: "Order status updated successfully", order });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

    const getInvoices = async (req, res) => {
        try {
          const invoices = await InvoiceModel.find({ orderd_by: req.user._id }).populate("orderd_by");
          res.send(invoices);
        } catch (error) {
          console.error(error);
          res.status(500).send("Internal Server Error");
        }
      };

      const getInvoiceByNo = async(req,res)=>{
        try{
          const invoice = await InvoiceModel.findOne({invoiceNo:req.params.id})
          res.status(200).send({
            success:true,
            invoiceData:invoice.invoice
          })
        }
        catch(error){
        }
      }


module.exports= {getInvoices,createOrder,getInvoiceByNo, editOrderStatus , deleteOrder, getSingleOrder ,getAllOrders}

// const { decode } = require("jsonwebtoken");
// const Order = require("../models/orderModel");
// const Product = require("../models/productModel");
// const User = require("../models/userModel");
// const InvoiceModel = require("../models/invoiceModel");
// const jwt = require("jsonwebtoken");
// const { sendEmail } = require("./emailCtrl");
// const invoice = require("./invoiceCtrl");
// function generateId() {
//   const timestamp = new Date().getTime();
//   const randomDigits = Math.floor(10000000 + Math.random() * 90000000); // Random 8-digit number
//   const orderId = `${timestamp}${randomDigits}`.substring(0, 8);
//   return orderId;
// }

// const createOrder = async (req, res, next) => {
//   const user = req.user;
//   let address = req.body.address;
//   let adr, placeofsup, gstNo;
//   for (let i = 0; i < user.address.length; i++) {
//     if (JSON.stringify(user.address[i]._id) == JSON.stringify(address)) {
//       adr = `${user.address[i].adr} , ${user.address[i].city} , ${user.address[i].state} - ${user.address[i].pincode}`;
//       placeofsup = user.address[i].city;
//       gstNo = user.address[i].gstNo;
//     }
//   }
//   let totalValue = parseInt(user.cart.totalValue);
//   let isCoupon = false;
//   
//   if (user.cart?.products?.length > 0) {
//     if (user.cart.isCouponApplied?.code) {
//       isCoupon = {
//         code: user.cart.isCouponApplied.code,
//         discountrs: parseInt(user.cart.isCouponApplied.discountValue),
//       };
//     }

//     const newOrder = {
//       products: user.cart.products,
//       total: totalValue,
//       orderby: user._id,
//       address: address,
//       transactionId: req.body.transactionId || generateId(),
//       invoiceNo: generateId(),
//     };

//     const createdOrder = await Order.create(newOrder);
//     const orders = await Order.find({ _id: createdOrder._id }).populate({
//       path: "products.product",
//       model: "product",
//     });

//     const orderArr = orders.map((order) => ({
//       transactionId: order.transactionId,
//       products: order.products.map((product) => {
//         return {
//           name: product.product.name,
//           image: product.product.images[0],
//           count: product.count,
//           total: product.total,
//           price: product.product.total,
//           hsn: product.product.hsnCode,
//           unit: product.product.unitMeausrement,
//         };
//       }),
//       total: order.total,
//       status: order.status,
//     }));

//     const detail = {
//       invoiceno: newOrder.invoiceNo,
//       userName: req.user.name,
//       userAdress: adr,
//       totalPrice: totalValue,
//       productDetails: orderArr[0].products,
//       isCoupon,
//       placeofsup,
//       gstNo: gstNo,
//     };
//     const invoiced = {
//       invoiceNo: newOrder.invoiceNo,
//       products: orderArr[0].products,
//       invoice: invoice(detail),
//       total: orderArr[0].total,
//       orderby: req.user._id,
//     };
//     await InvoiceModel.create(invoiced);
//     await User.findOneAndUpdate(
//       { _id: req.user._id },
//       {
//         $set: {
//           "cart.products": [],
//           "cart.totalValue": 0,
//           "cart.isCouponApplied": {},
//         },
//       },
//       { new: true }
//     );
//     res.redirect(`https://eccomerce1.deepmart.shop/users/orders/success`);
//   } else {
//     res.status(500).send({ error: "No product found in user cart" });
//   }
// };

// const checkUser = async (req, res, next) => {
//   let token = req.body.userid;
//   try {
//     if (token) {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded?.id);
//       req.user = user;
//       next();
//     }
//   } catch (error) {
//     res.json({ error: "Not Authorized token expired, Please Login again" });
//   }
// };

// const getOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ orderby: req.user._id }).populate({
//       path: "products.product",
//       model: "product",
//     });
//     
//     const orderArr = orders.map((order) => ({
//       transactionId: order.transactionId,
//       products: order.products.map((product) => ({
//         name: product.product.name,
//         id: product.product._id,
//         image: product.product.images[0],
//         category: product.product.category,
//         count: product.count,
//         total: product.total,
//       })),
//       total: order.total,
//       status: order.status,
//       address: order.address,
//     }));

//     res.send(orderArr);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// };

// const getInvoices = async (req, res) => {
//   try {
//     const invoices = await InvoiceModel.find({ orderby: req.user._id });
//     res.send(invoices);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// };

// const getAdminProduct = async (req, res) => {
//   try {
//     const orders = await Order.find().populate({
//       path: "products.product",
//       model: "product", // Replace 'Product' with the actual name of your product model
//     });

//     const orderArr = await Promise.all(
//       orders.map(async (order) => {
//         const user = await User.findById(order.orderby);
//         
//         const address = user.address?.find(
//           (adr) => JSON.stringify(adr._id) == order.address
//         );

//         return {
//           transactionId: order.transactionId,
//           products: order.products.map((productDetail) => ({
//             name: productDetail.product.name,
//             count: productDetail.count,
//             total: productDetail.total,
//           })),
//           total: order.total,
//           status: order.status,
//           address: address
//             ? `${address.adr}-${address.city}-${address.state}-${address.pincode}`
//             : null,
//         };
//       })
//     );

//     res.send(orderArr);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// };

// const editOrderStatus = async (req, res) => {
//   try {
//     const status = req.body.status;
//     const invoiceNo = req.body.id;

//     const order = await Order.findOneAndUpdate(
//       { invoiceNo },
//       { status },
//       { new: true } // Return the modified document
//     );

//     if (!order) {
//       return res.status(404).json({ error: "Order not found" });
//     }

//     
//     res.json({ message: "Order status updated successfully", order });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// module.exports = {
//   createOrder,
//   getOrders,
//   getAdminProduct,
//   editOrderStatus,
//   checkUser,
//   getInvoices,
// };
