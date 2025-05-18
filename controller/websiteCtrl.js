const asyncHandle = require("express-async-handler");
const WebsiteModel = require("../models/WebsiteModel");

const updateConfig = asyncHandle(async (req, res) => {
  const siteConfig = req.body;
  const alreadyavail = await WebsiteModel.findOne({ name: siteConfig.name });
  if (alreadyavail) {
    try {
      const updatesiteConfig = await WebsiteModel.findOneAndUpdate(
        { name: siteConfig.name },
        siteConfig
      );
      res.send({
        message: "siteConfig updated sucessfully",
        success: true,
        siteConfig: updatesiteConfig,
      });
    } catch (error) {
      res.send({ message: error.message, error });
    }
  } else {
    try {
      const newsiteConfig = await WebsiteModel.create(siteConfig);
      res.send({
        message: "siteConfig Added sucessfully",
        success: true,
        siteConfig: newsiteConfig,
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

const getConfig = asyncHandle(async (req, res) => {
  const siteConfig = await WebsiteModel.find();
  if(siteConfig.length>=1){
      res.json(siteConfig[0]);
    }else{
      res.json({});
  }
});



module.exports = {
    updateConfig,
    getConfig,
};
