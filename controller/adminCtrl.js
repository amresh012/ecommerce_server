const asyncHandle = require("express-async-handler");
const Products = require("../models/productModel");
const Contact = require("../models/contactUsModel");
const Bulk = require("../models/bulkModel");
const Order = require("../models/orderModel");
const Invoices = require("../models/invoiceModel");
const CouponCodes = require("../models/discountModel");
const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");

const getAdminData = asyncHandle(async (req, res) => {
  try {
    const date = new Date();

    const totalNewCustomers = await userModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $match: {
          month: date.getMonth() + 1,
        },
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const totalOrders = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          dayOfMonth: { $dayOfMonth: "$createdAt" },


        },
      },
      {
        $match: {
          month: date.getMonth()+1,
          year: date.getFullYear(),
          dayOfMonth: date.getDate()
        },
      },
      {
        $group: {
          _id: null,
          count:{
            $sum: 1
          }
        },
      },
    ]);

    const demographicCount = await userModel.aggregate([
      {
        $group: {
          _id: "$gender",      // Group by the 'gender' field
          count: { $sum: 1 }   // Count the number of documents per gender
        }
      },
      {
        $sort: { count: -1 }   // Optional: sort by count descending
      }
    ])
 

    const totalProducts = await productModel.find().countDocuments();

    const totalCategories = await productModel.distinct("category");
    
    // total payment per day
     const totalPaymentsToday = await orderModel.aggregate([
       {
         $match: {
           createdAt: {
             $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of the current day
             $lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of the current day
           },
         },
       },
       {
         $group: {
           _id: null, // Grouping all orders from the current day
           currentDayPayments: { $sum: "$total" }, // Summing the `total` field for today's orders
         },
       },
     ]);
    // total payment all time
      const totalPaymentsAllTime = await orderModel.aggregate([
        {
          $group: {
            _id: null, // We want the total sum across all documents
            totalPayments: { $sum: "$total" }, // Summing the `amount` field
          },
        },
      ]);
    
     const paymentsTodayValue = totalPaymentsToday.length > 0 ? totalPaymentsToday[0].currentDayPayments : 0;
     const paymentsAllTimeValue =totalPaymentsAllTime.length > 0 ? totalPaymentsAllTime[0].totalPayments : 0;

    
    
    const recentOrders = await orderModel.find().populate("users").sort({ createdAt: -1 }).limit(9);
    
    const ordersSummary = [];
    
    const customersSummary = await userModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
      },
      {
        $group: {
          _id: '$month',
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const categoriesSummary = await productModel.aggregate([
      {
        $group: {
          _id: "$category",
          count: {
            $sum: 1
          }
        }
      }
    ]);

    // invoiceData
    const invoiceData =   res.status(200).json({
      success: true,
      totalNewCustomers:
        totalNewCustomers.length > 0 ? totalNewCustomers[0].count : 0,
      totalOrders: totalOrders.length > 0 ? totalOrders[0].count : 0,
      totalProducts,
      totalCategories: totalCategories.length,
      totalPaymentsToday: paymentsTodayValue, // Send numeric value
      totalPaymentsAllTime: paymentsAllTimeValue,
      recentOrders,
      ordersSummary,
      customersSummary,
      categoriesSummary,
      demographicCount
    });
  } catch (error) {
    
    res.status(400).send(error);
  }
});

module.exports = { getAdminData };
