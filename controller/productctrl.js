const asyncHandle = require("express-async-handler");
const ProductModel = require("../models/productModel");
const expressAsyncHandler = require("express-async-handler");
const exceljs = require("exceljs");
const xlsx = require("xlsx");

const addProduct = asyncHandle(async (req, res) => {
  let product = req.body;
  const alreadyavail = await ProductModel.findOne({ name: product.name });
  if (alreadyavail) {
    try {
      const updateproduct = await ProductModel.findOneAndUpdate(
        { name: product.name },
        product
      );
      res.send({
        message: "Product updated sucessfully",
        success: true,
        product: updateproduct,
      });
    } catch (error) {
      res.send({ message: error.message, error });
    }
  } else {
    try {
      const newproduct = await ProductModel.create(product);
      res.send({
        message: "Product Added sucessfully",
        success: true,
        product: newproduct,
      });
    } catch (error) {
      if (error.message.includes("duplicate")) {
        res.send({
          error: `Entered ${
            error.message.split("{")[1].split(":")[0]
          } is already registered`,
        });
      } else {
        res.send({ error: error.message, errorDetail: error });
      }
    }
  }
});
// get product by id
const getProductById = asyncHandle(async (req, res) => {
  // const _id = req.params.id;
  const _id = req.params.id || req.body.id;

  if (_id) {
    try {
      const product = await ProductModel.findById(_id)
        .populate("subcategory")
        .populate({
          path: "reviews",
          model: "review",
          select:"title rating desc"
        });
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(400).json({ error: "Invalid request" });
  }
});

const deleteProduct = asyncHandle(async (req, res) => {
  const _id = req.params.id;
  if (_id) {
    try {
      const deletedProduct = await ProductModel.findByIdAndDelete({ _id });
      if(deletedProduct){
        return res.json({ success: true, message: "Deleted Sucessfully", _id });
      }
      else{
        return res.json({ success: false, message: "Product doesn't exist", _id });
      }
    } catch (error) {
      res.json({ error: error.message });
    }
  } else res.status(500).send({ error: error.message });
});

const updateproduct = asyncHandle(async (req, res) => {
  if (req.body._id) {
    const { _id } = req.body;
    try {
      const updateproduct = await ProductModel.findOneAndUpdate(
        { _id },
        req.body
      );
      res.status(200).json({ success: true , newupdatedproducrt:updateproduct });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else res.json("invalid Operation");
});

// search product controller

const searchProduct = asyncHandle(async (req, res) => {
  try {
    let { search, category, subcategory, brand } = req.query;
    category = category?.replaceAll('-', ' ')?.toLowerCase();
    subcategory = subcategory?.replaceAll('-', ' ')?.toLowerCase();
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { category: { $regex: new RegExp(search, "i") } },
        { brand: { $regex: new RegExp(search, "i") } },
      ];
    }

    if (category) {
      filter.category = { $regex: new RegExp(category, "i") };
    }

    if (subcategory) {
      filter.subcategory = { $regex: new RegExp(subcategory, "i") };
    }

    if (brand) {
      filter.brand = { $regex: new RegExp(brand, "i") };
    }

    const products = await ProductModel.find(filter)
      .populate("subcategory")
     
    res.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const getallProduct = asyncHandle(async (req, res, next) => {
  const Product = await ProductModel.find().populate("subcategory").sort({'updatedAt': 'desc'})
  if (req.query) {
    next();
  } else {
    res.json(Product);
  }
});

const ValidateSchema = expressAsyncHandler(async (data) => {
  const errors = {};

  const productInstance = new ProductModel(data);

  productInstance.validateSync();

  const validationErrors = productInstance.errors;

  if (validationErrors) {
    Object.keys(validationErrors).forEach((key) => {
      errors[key] = validationErrors[key].message;
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
});
const uploadBulkProduct = expressAsyncHandler(async (req, res) => {
  const workbook = xlsx.readFile(req?.file?.path);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const excelData = xlsx.utils.sheet_to_json(sheet);
  const validProducts = [];
  const invalidProducts = [];

  for (let i = 0; i < excelData.length; i++) {
    const row = excelData[i];

    const productData = {
      name: row["name"],
      images: row["images"]?.split(","),
      price: row["price"],
      category: row["category"],
      subcategory: row["subcategory"],
      itemCode: row["itemcode"],
      hsnCode: row["hsncode"],
      perpiece: row["priceperpiece"],
      unitMeausrement: row["unitofmeasurement"],
      measurement: row["meausrement"],
      discount: row["discount"],
      mindiscription: row["minidiscription"],
      datasheet: row["datasheet"],
    };

    const validationResult = await ValidateSchema(productData);

    if (validationResult.isValid) {
      validProducts.push(productData);
    } else {
      invalidProducts.push({
        rowIndex: i,
        validationError: validationResult?.errors,
      });
    }
  }

  res.send({ validProducts, invalidProducts });
});

module.exports = {
  addProduct,
  getallProduct,
  deleteProduct,
  getProductById,
  updateproduct,
  searchProduct,
  uploadBulkProduct,
};
