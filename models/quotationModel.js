const mongoose = require("mongoose");
const QuotationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value);
        },
        message: (props) => `${props.value} is not a valid email address.`,
      }
    },
    mobile: {
      type: String,
      required: true,
    },
    product:{
        type:String,
        required:true
    },
    desc:{
      type: String,
      required: true,
    },
    city:{
        type:String,
        required:[true, "City is Required Please fill a city name"]
    },
    // remarks:{
    //    type:String,
    //    required:true
    // }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("quotation", QuotationSchema);
