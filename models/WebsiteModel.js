const mongoose = require("mongoose");
const WebsiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    title:{
      type: String,
    },
    logo: {
      type: String,
      requird:true
    },
    mainbg: {
      type: String,
      required: true,
    },
    primarybg: {
      type: String,
      required: true,
    },
    secondarybg: {
      type: String,
      required: true,
    },
    headerCol: {
      type: String,
      required: true,
    },
    footerCol: {
      type: String,
      required: true,
    },
    textCol: {
      type: String,
      required: true,
    },
    homepageBanner: {
      type: Array,
    },
    
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("website", WebsiteSchema);
