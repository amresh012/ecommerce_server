const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model

var orderSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      require: true,
    },
    order_id:{
      type:String,
      require:true
    },
    invoiceNo: {
      type: String,
      require:true
    },
    invoiceData:{
      type:mongoose.Types.ObjectId,
      ref:"invoice"
    },
    products: [
      {
        product: {
          type: mongoose.Types.ObjectId,
          ref: "product",
        },
        count: Number,
        total: Number,
      },
    ],
    total: { type: Number, require: true },
    users: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    address: {
      type: mongoose.Types.ObjectId,
      ref:"Address",
      require:true
    },
    status: {
      type: String,
      default: "Processing",
      enum:["Processing", "Success", "Order Confirmed", "Shipped", "Deliverd"]
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Order", orderSchema);