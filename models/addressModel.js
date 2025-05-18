const mongoose = require("mongoose");
var addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^[a-zA-Z\s]+$/.test(value);
        },
        message: (props) => `${props.value} is not a valid name.`,
      },
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value) {
          return /^[6-9]\d{9}$/.test(value);
        },
        message: (props) =>
          `${props.value} is not a valid Indian mobile number.`,
      },
    },
    address: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    zipcode: {
      type: String,
    },
    type:{
      type: String,
      
    }
  },
  {
    timestamps: true,
  }
);
const Address = mongoose.models.Address || mongoose.model('Address', addressSchema);
module.exports = Address
