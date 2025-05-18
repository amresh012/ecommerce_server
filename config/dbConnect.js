const { default: mongoose } = require("mongoose");
require('dotenv').config();

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    if (conn) {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
  }
};
module.exports = dbConnect;
