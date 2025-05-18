// routes/coupon.js
const express = require('express');
const router = express.Router();
const User = require("../models/userModel")
const Coupon = require("../models/discountModel");
const { generateCouponCode, calculateExpiryDate } = require('../utils/couponUtils');




// Create a new coupon with generated code and expiry date
const CreateCopoun = async (req, res) => {
  try {
    const { discountType, discountValue, usageLimit, daysValid } = req.body;

    // Generate the coupon code and expiry date
    const code = generateCouponCode();//default length will be 4
    const expiryDate = calculateExpiryDate(daysValid);

    const newCoupon = new Coupon({
      code,
      discountType,
      discountValue,
      expiryDate,
      usageLimit,
    });

    await newCoupon.save();
    res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });
  } catch (error) {
     
    res.status(500).json({ error: 'Failed To Create Copoun Something Went Wrong' });
  }
};

// Validate a coupon
const ValidateCopoun = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code });
    if (!coupon || !coupon.isActive || coupon.expiryDate < new Date() || coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Invalid or expired coupon' });
    }
    res.status(200).json({ coupon });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const ApplyCopoun = async (req, res, next) => {
  try {
    // Ensure coupon code exists in the request body
    const { code } = req.body;
    if (!code) {
      return res.status(400).send("Coupon code is required.");
    }

    // Fetch the user by ID and populate their cart details if necessary
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Check if a coupon is already applied
    if (user.cart.isCouponApplied?.code) {
      return res.status(400).send({
        success:false,
        error: "Coupon is already applied to your cart"
      });
    }

    // Find the coupon by code
    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return res.status(400).send({
        success:false,
        message: "Invalid coupon code."
      });
    }

    // Calculate the discount value based on the coupon type (percentage or fixed amount)
    let discountValue = 0;
    if (coupon.type === "percentage") {
      discountValue = (user.cart.totalValue * coupon.discountValue) / 100;
    } else {
      discountValue = coupon.discountValue;
    }
    // Ensure the totalValue doesn't go negative after applying the discount
    const newTotalValue = user.cart.totalValue - discountValue;
    if (newTotalValue < 0) {
      return res.status(400).send({
        error: "The coupon discount exceeds the total value of your cart.",

      });
    }
    else{
      user.cart.totalValue = newTotalValue;
      user.cart.isCouponApplied = {
        code: coupon.code,
        discountValue: discountValue,
      };
     
      // Save the updated user cart and update the copoun count
      coupon.usageCount += 1;
      await coupon.save(); 
      await user.save();
  
      // Send the updated cart back to the client
      res.status(200).json({
        message: "Coupon applied successfully!",
        cart: user.cart
      });
    }

    // Apply the coupon to the user's cart
  } catch (error) {
    // Handle unexpected server errors
    console.error("Error applying coupon:", error);
    res.status(500).send("An error occurred while applying the coupon.");
  }
};



// Get all coupons
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(coupons);
  } catch (error) {
    
    res.status(500).json({ error });
  }
};

// Get a single coupon by ID
const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a coupon
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { discountType, discountValue, expiryDate, usageLimit } = req.body;
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      {discountType, discountValue, expiryDate, usageLimit },
      { new: true }
    );
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.status(200).json({ message: 'Coupon updated successfully', coupon });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a coupon
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {
  CreateCopoun,
  ValidateCopoun ,
   ApplyCopoun ,
   getCoupons
    ,deleteCoupon ,
    updateCoupon ,
    getCouponById};
