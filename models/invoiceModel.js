const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNo:{
    type:Number,
    required:true,
    unique:true
  },
  products: {
    type: Array,
    required: true,
  },
  invoice:{
    type:String,
    ref: "User",
  },
  orderd_by:{
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  total: {
    type: String,
    required: true,
  },

});

const OTP = mongoose.model('invoice', invoiceSchema);

module.exports = OTP;



