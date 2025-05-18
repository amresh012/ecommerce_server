const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    // readtime:{
    //   type: String,
    //   required: true,
    // },
    aurthor: {
      type: String,
      required: true,
    },
  },
  {timestamps: true}
);

module.exports = mongoose.model("blogs", blogSchema);
