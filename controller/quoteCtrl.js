const asyncHandle = require("express-async-handler");
const Quotation = require("../models/quotationModel")

const addquote = asyncHandle(async (req, res) => {
  try {
    // Create the quotation directly without checking for duplicates
    await Quotation.create(req.body);

    res.json({
      success: "Your request has been submitted successfully.",
    });
  } catch (error) {
    if (error.message.includes("duplicate")) {
      res.json({
        error: `Entered ${
          error.message.split("{")[1].split(":")[0]
        } is already sent!`,
      });
    } else {
      res.json({ error: error.message });
    }
  }
});


// const addquote = asyncHandle(async (req, res) => {
//   try {
//     const { email, mobile, product } = req.body;

//     // Check if a quotation with the same email, mobile, and product already exists
//     const existingQuote = await Quotation.findOne({ email, mobile, product });

//     if (existingQuote) {
//       return res.json({
//         error: "You have already submitted a request for this product using the same email and mobile number!",
//       });
//     }

//     // If no duplicate is found, create a new quotation
//     await Quotation.create(req.body);

//     res.json({
//       success: "Your request has been submitted successfully.",
//     });
//   } catch (error) {
//     if (error.message.includes("duplicate")) {
//       res.json({
//         error: `Entered ${
//           error.message.split("{")[1].split(":")[0]
//         } is already sent!`,
//       });
//     } else {
//       res.json({ error: error.message });
//     }
//   }
// });

const getallQuote = asyncHandle(async (req, res) => {
  const test = await Quotation.find()
  res.json(test);
});

const deleteQuote = asyncHandle(async(req,res)=>{
  if(req.params.id){
    const {id} = req.params;
    try {
      const deletedContact = await Quotation.findByIdAndDelete(id);
      if(deletedContact){
        res.json({ success: true, message: "Deleted Sucessfully", id });
      }
      else{
        res.json({ success: false, message: "Query doesn't exist", id });
      }
    } catch (error) {
      res.json(error.message)
    }
  }else(
    res.json("invalid Operation")
  )
})

const QuotationDetails = asyncHandle(async(req,res)=>{
  if(req.params.id){
    const {id} = req.params;
    try {
      const contact = await Quotation.findById(id);
      if(contact){
        res.json({ success: true, ...contact._doc });
      }
      else{
        res.json({ success: false, message: "Query doesn't exist", id });
      }
    } catch (error) {
      res.json(error.message)
    }
  }else(
    res.json("invalid Operation")
  )
})

const updateQuote = asyncHandle(async(req,res)=>{
  if(req.body._id){
    const {_id} = req.body
    try {
      await Quotation.findByIdAndUpdate({_id},req.body)
      res.json("Remark Updated Sucessfully")
    } catch (error) {
      res.json(error.message)
    }
  }else(
    res.json("invalid Operation")
  )
})


module.exports = { addquote,getallQuote,deleteQuote,updateQuote,QuotationDetails};
