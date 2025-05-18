const mongoose = require("mongoose");
const BulkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    mobile: {
      type: String,
      require: true,
    },
    productName: {
      type: Array,
      require: true,
    },
    quantity: {
      type: String,
      require: true,
    },
    remark: {
      type: String,
      default: "pending",
      remarkState:["processing" , "created","pending"]
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("bulk", BulkSchema);
