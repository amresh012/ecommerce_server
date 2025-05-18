const asyncHandle = require("express-async-handler");
const User = require("../models/userModel");
const Product = require("../models/productModel");

const applyDiscount = (price, discountPercentage) => {
  return price - (price * discountPercentage) / 100;
};
const getcart = asyncHandle(async (req, res) => {
  const { _id } = req.user;

  try {
    const user = await User.findOne({ _id }).populate({
      path: "cart.products.product",
      select:
        "_id name price images corporateDiscount weight",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const data = user.cart.products.map((item) => {
      const product = item.product;
      let discount = 0;
      return {
        name: product?.name, 
        price: product?.price,
        url: product?.images[0],
        weight:product?.weight,
        count: item?.count,
        total: item?.total,
        _id: product?._id,
        discount:product?.corporateDiscount,
      };
    });
    const totalCartValue = user.cart.products.reduce(
      (total, item) => total + item?.total,
      0
    );
    const totalProductPrice = user.cart.products.reduce(
      (total, item) => total + item.product?.price * item.count,
      0
    );
   
    const totalCartWeight = user.cart.products.reduce((total, item) => {
      const itemWeight = item?.product?.weight;  // Assuming weight is in the product model
      return total + itemWeight * item?.count;
    }, 0);

    user.cart.totalValue = totalCartValue;
    res.json({ products: data, totalCartValue, totalProductPrice , totalCartWeight });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const addItemToCart = asyncHandle(async (req, res) => {
  const { _id } = req.user;
  const { id, qty } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const productId = product._id;
    const user = await User.findOne({ _id });
    const cartItem = user.cart.products.find((item) =>
      item.product.equals(productId)
    );
    let discount = 0;
    if (cartItem) {
      cartItem.count += qty;
      cartItem.total = applyDiscount(product.price * cartItem.count, discount);
    } else {
      user.cart.products.push({
        product: id,
        count: qty,
        total: applyDiscount(product.price * qty, discount),
      });
    }
    const totalCartValue = user.cart.products.reduce(
      (total, item) => total + item.total,
      0
    );
  
    // Update the cart's total value and total weight
    user.cart.totalValue = totalCartValue;
    await user.save();
    res.json(user.cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const removeAnItem = asyncHandle(async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;

  try {
    const user = await User.findOneAndUpdate(
      { _id },
      {
        $pull: { "cart.products": { product: id } },
      },
      { new: true }
    ).populate({
      path: "cart.products.product",
      select: "_id name price images",
    });

    const data = user.cart.products.map((item) => {
      const product = item.product;
      return {
        name: product.name, // Include product name
        price: product.price,
        url: product.images[0],
        count: item.count,
        total: item.total,
        _id: product._id,
      };
    });
    const totalCartValue = user.cart.products.reduce(
      (total, item) => total + item.total,
      0
    );
    user.cart.totalValue = totalCartValue;
    
    res.json({ products: data, totalCartValue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const updatecart = asyncHandle(async (req, res) => {
  const { _id } = req.user;
  const { id, type } = req.body;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findOne({ _id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItem = user.cart.products.find(
      (item) => item.product.toString() === id
    );
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    let previousQty = cartItem.count;

    if (type === "inc") {
      
      previousQty = previousQty + 1;
      
    }

    if (type === "dec") {
      if (previousQty > 1) {
        previousQty = previousQty - 1;
      } else {
        return res.send({ error: "Quantity Should not be less than 1" });
      }
    }
    if (type === "value") {
      if (!isNaN(parseInt(req.body.value))) {
        previousQty = parseInt(req.body.value);
      }

    }

    let discount = 0;
    if (user?.role) {
      switch (user.role) {
        case "user":
          discount = parseInt(product.corporateDiscount);
      }
    }

    cartItem.count = previousQty;
    cartItem.total = applyDiscount(product.price * previousQty, discount);

    user.cart.totalValue = user.cart.products.reduce(
      (total, item) => total + item.total,
      0
    );

    await user.save();

    await user.populate({
      path: "cart.products.product",
      select: "_id name price images",
    });    
    res.send("Qty Updated Sucessfully")
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
const resetCart = asyncHandle(async (req, res) => {
  const { _id } = req.user;

  try {
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart.products = [];
    user.cart.totalValue = 0;

    await user.save();
    res.status(200).json({ message: "Cart reset successfully"});
  } catch (error) {
    console.error("Error resetting cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = {
  addItemToCart,
  getcart,
  removeAnItem,
  updatecart,
  resetCart
  
};
