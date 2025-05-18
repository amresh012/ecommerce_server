const asyncHandle = require("express-async-handler");
const Bulk = require("../models/bulkModel");


const addBulk = asyncHandle(async (req, res) => {
  try {
    await Bulk.create(req.body);
    const resp = {
      success: "You request is submitted sucessfully",
    };
    res.json(resp);
  } catch (error) {
    if (error.message.includes("duplicate")) {
      res.json({
        error: `Entered ${
          error.message.split("{")[1].split(":")[0]
        } is already sent !`,
      });
    } else {
      res.json({ error: error.message });
    }
  }
});
const getallBulk = asyncHandle(async (req, res) => {
  const test = await Bulk.find();
  res.json(test);
});

const deletebulk = asyncHandle(async (req, res) => {
  
  if (req.body._id) {
    const { _id } = req.body;
    try {
      await Bulk.findByIdAndDelete({ _id });
      res.json("Deleted Sucessfully");
    } catch (error) {
      res.json(error.message);
    }
  } else res.json("invalid Operation");
});

const updateRemarkbulk = asyncHandle(async (req, res) => {
  if (req.body._id) {
    const { _id } = req.body;
    try {
      await Bulk.findByIdAndUpdate({ _id }, req.body);
      res.json("Remark Updated Sucessfully");
    } catch (error) {
      res.json(error.message);
    }
  } else res.json("invalid Operation");
});

module.exports = { addBulk, getallBulk, deletebulk, updateRemarkbulk };
