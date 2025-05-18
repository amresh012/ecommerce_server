const generateCouponCode = (length = 4) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result ="KFS"+'';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };
  
  // Function to calculate the expiry date
  const calculateExpiryDate = (daysValid = 30) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysValid);
    return expiryDate;
  };
  
  module.exports = { generateCouponCode, calculateExpiryDate };