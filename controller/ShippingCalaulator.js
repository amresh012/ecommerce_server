// shiprocketController.js
const axios = require('axios');

exports.shiprocketRateCalculation = async (req, res) => {
  try {
    const { pickup_postcode, delivery_postcode, weight, declared_value } = req.body;
    let rs_data = await srShippingRateCalculation(pickup_postcode, delivery_postcode, weight, declared_value);
    res.status(200).json(rs_data);

  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.toString(),
    });
  }
};

async function srShippingRateCalculation(pickup_postcode, delivery_postcode, weight, declared_value) {
  return new Promise(async (resolve, reject) => {
    let resData = {
      status: false,
      mainToken: {},
      message: "Fail!!",
    };
    
    try {
      let getToken = process.env.SHIP_ROCKET_TOKEN
      let params = `pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&weight=${weight}&cod=1&declared_value=${declared_value}&rate_calculator=1&blocked=1&is_return=0&is_web=1&is_dg=0&only_qc_couriers=0`;
      if (getToken) {
        var config = {
          method: 'get',
          maxBodyLength: Infinity,
          url: 'https://apiv2.shiprocket.in/v1/external/courier/serviceability?' + params,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken,
          }
        };
        
        axios(config).then(function (response) {
          resData.status = true;
          resData.message = 'Success!!';
          resData.mainset = response.data;
          resolve(resData);
        }).catch(function (error) {
          console.error(error);
          resData.message = 'Error!!';
          resData.mainset = JSON.stringify(error);
          reject(resData);
        });
      } else {
        console.error('Authentication failed in ShippingRateCalculation');
        resData.message = 'Authentication Error';
        reject(resData);
      }

    } catch (e) {
      // console.error(e);
      resData.message = 'Error in ShippingRateCalculation';
      reject(resData);
    }
  });
}
