const asyncHandle = require("express-async-handler");
const userModel = require('../models/userModel');
const request = require("request");

const sendSms = asyncHandle(async (req, res)=>{
    try{
        const {users} = req.body;

        const templateId = '1707171654843926162';
        const senderId = 'ITSYBZ';
        const message = "Dear Mayank Jha, Welcome to Itsybizz! We're thrilled to have you on board and ready to support your business journey. Let's succeed together!";
        const entityID = '1001558230000012624';
        const mobile = '';
        
        if(!mobile){
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Mobile no. not provided"
            })
        }
        if(templateId && senderId && message && entityId){
            let options = {
                url: `${process.env.API_URL}username=${process.env.API_KEY}&password=${process.env.API_SECRET}&sender=${senderId}&sendto=${req.body.mobile}&entityID=${entityId}&templateID=${templateId}&message=${message}`
            }

            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                      
                } else {
         
                }
              })
        }
        else{
            throw new Error('Please provide all the fields')
        }
    }
    catch(err){
        throw new err;
    }

})

module.exports = {sendSms};