const mongoose = require("mongoose");
const contactusShema = new mongoose.Schema(
  {
    fullname: {
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
      unique:true,
      validate: {
        validator: function (value) {
          return /^[6-9]\d{9}$/.test(value);
        },
        message: (props) =>
          `${props.value} is not a valid Indian mobile number.`,
      },
    },
    reason:{
      type: String,
      required: true,
    },
    customReason:{
      type: String,
    },
    remarks: {
      type: String,
      default: "No Remarks",
    },
    // address:[
    //  {
    //   city:{
    //     type:String
    //   },
    //   state:{
    //     type:String
    //   },
    //  }
    // ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("contactus", contactusShema);
