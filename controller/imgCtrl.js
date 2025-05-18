const asyncHandle = require("express-async-handler");
const imgModel = require("../models/imagesModel");
const { mongooseError } = require("../middlewares/errorHandler");

const addimage = asyncHandle(async (req, res) => {
    const {name, url } = req.body;
    try {
        await imgModel.create(req.body);
        res.send({
            message: "image Added sucessfully",
            success: true,
        });
    } catch (error) {
    }

});

const getImg = asyncHandle(async (req, res) => {
    const imgConfig = await imgModel.find();
    res.json(imgConfig);
});

const deleteImage = asyncHandle(async (req, res) => {
  const { id } = req.params; // Ensure the ID is taken from params

  if (!id) {
    return res.status(400).json({
      message: "Image ID is required",
      success: false,
    });
  }

  try {
    const image = await imgModel.findByIdAndDelete(id); // Find and delete the image by its ID

    if (!image) {
      return res.status(404).json({
        message: "Image not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Image deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({
      message: "Error deleting image",
      success: false,
      error: mongooseError(error),
    });
  }
});




module.exports = {
  addimage,
  getImg,
  deleteImage,
};