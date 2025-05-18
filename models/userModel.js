const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
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
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value) {
          return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value);
        },
        message: (props) => `${props.value} is not a valid email address.`,
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
    gstNo: {
      type: String,
      validate: {
        validator: function (value) {
          // GST number format validation
          if (value) {
            return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(
              value
            );
          }
        },
        message: (props) => `${props.value} is not a valid GST number.`,
      },
    },
   gender:{
      type:String,
      genders:["male", "female"],
      required:true,
      defaut:"male",
      message:(props) => `${props.value} is not a valid gender.`
   },
    panNo: {
      type: String,
      validate: {
        validator: function (value) {
          // PAN number format validation
          if (value) {
            return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
          }
        },
        message: (props) => `${props.value} is not a valid PAN number.`,
      },
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "User",
      roles: ["Admin", "Employee", "User"],
    },
    allowedRoutes: {
      type: [String],
      enum: [
        "dashboard",
        "users",
        "contact us",
        "orders",
        "products",
        "blogs",
        "coupon",
        "quotation",
      ],
      default: [],
    },
    super: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    profileImg:{
       type: String,
    },
    cart: {
      products: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
          },
          count: Number,
          total: Number,
        },
      ],
      totalValue: { type: Number, default: 0 },
      isCouponApplied: {
        type: Object,
      },
    },
    order:[ { type: mongoose.Types.ObjectId, ref: "Order" }],
    address: [{ type: mongoose.Types.ObjectId, ref: "Address" }],
    refreshToken: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
  },
  {
    timestamps: true,
  }
);

//bcript password
userSchema.pre("save", async function (next) {
  //bcript the password if it modified
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
//comapare password
userSchema.methods.isPasswordMatched = async function (enterdPassword) {
  return await bcrypt.compare(enterdPassword, this.password);
};
//Reset Password Token
userSchema.methods.createPasswordResetToken = async function () {
  const resettoken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resettoken)
    .digest("hex");
  this.passwordResetExpire = Date.now() + 30 * 60 * 1000; //10 minute expire
  return resettoken;
};

module.exports = mongoose.model("User", userSchema);
