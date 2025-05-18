const mongoose = require("mongoose");


const reviewSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    rating: { type: Number, required: true },
    review: { type: String, required: true },
    user: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],  // Users who liked the review
    dislikes: [{ type: mongoose.Types.ObjectId, ref: 'User' }]
  },
  {
    timestamps: true,
  }
);

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
    sku: {
      type: String,
      require: [true, "sku Code not generated unable to add producut"],
    },
    price: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
      required: true,
    },
    itemCode: {
      type: Number,
      unique: true,
    },
    hsnCode: {
      type: Number,
      unique: true,
    },
    perpiece: {
      type: String,
    },
    measurment: {
      type: String,
    },
    length: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    quantity: {
      type: Number,
    },
    corporateDiscount: {
      type: String,
      validate: {
        validator: function (value) {
          return (
            /^\d+(\.\d+)?$/.test(value) &&
            parseFloat(value) >= 0 &&
            parseFloat(value) <= 100
          );
        },
        message: (props) =>
          `${props.value} is not a valid discount percentage.`,
      },
    },
    mindiscription: {
      type: String,
    },
    type:{
       type:String,
       enum:["Best Seller", "New", "Featured"]

    },
    features:{
     type:[String],
     required:true
    },
    datasheet: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("product", ProductSchema);
