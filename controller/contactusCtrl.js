const asyncHandle = require("express-async-handler");
const ContactUs = require("../models/contactUsModel");
const addContactus = asyncHandle(async (req, res) => {
  try { await ContactUs.create(req.body);
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
const getallContactUs = asyncHandle(async (req, res) => {
  const test = await ContactUs.find();
  
  res.json(test);
});

const deleteContact = asyncHandle(async(req,res)=>{
  if(req.params.id){
    const {id} = req.params;
    try {
      const deletedContact = await ContactUs.findByIdAndDelete(id);
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

const contactDetails = asyncHandle(async(req,res)=>{
  if(req.params.id){
    const {id} = req.params;
    try {
      const contact = await ContactUs.findById(id);
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

const updateRemarkContact = asyncHandle(async(req,res)=>{
  if(req.body._id){
    const {_id} = req.body
    try {
      await ContactUs.findByIdAndUpdate({_id},req.body)
      res.json("Remark Updated Sucessfully")
    } catch (error) {
      res.json(error.message)
    }
  }else(
    res.json("invalid Operation")
  )
})


module.exports = { addContactus,getallContactUs,deleteContact,updateRemarkContact,contactDetails};
