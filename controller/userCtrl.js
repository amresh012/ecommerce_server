const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshtoken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("./emailCtrl");
const { mongooseError } = require("../middlewares/errorHandler");
const request = require("request");
const randomstring = require("randomstring");
const OTP = require("../models/otpmodel");
const Address = require("../models/addressModel")

// Create a User ----------------------------------------------
const checkSignup = async (req, res) => {
  const { name, email, mobile, gstNo, panNo } = req.body;
  const isNameValid = /^[a-zA-Z\s]+$/.test(name);
  const isMobileValid = /^[6-9]\d{9}$/.test(mobile);
  const isGSTNoValid =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(
      gstNo
    );
  const isPanNoValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNo);

  if (!isNameValid) {
    res.json({ error: `${name} is not a valid name.` });
  } else if (!isMobileValid) {
    res.json({ error: `${mobile} is not a valid mobile number.` });
  } else if (!isGSTNoValid && gstNo) {
    res.json({ error: `${gstNo} is not a valid GST number.` });
  } else if (!isPanNoValid && panNo) {
    res.json({ error: `${panNo} is not a valid PAN number.` });
  } else {
    const findByEmail = await User.findOne({ email });
    const findByMobile = await User.findOne({ mobile });

    if (findByEmail) {
      res.json({ error: "This email is already in use!" });
    } else if (findByMobile) {
      res.json({ error: "This mobile number is already in use!" });
    } else {
      res.json({ success: true });
    }
  }
};

const verifyUser = asyncHandler(async (req, res) => {
  let token;
  // 
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        req.user = user;
        res.json({ success: true, user });
      }
    } catch (error) {
      res.json("Not Authorized token expired, Please Login again");
    }
  } else {
    res.json(" There is no token attached to header");
  }
});

const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    try {
      let newUser;
      const totalUsers = await User.find().countDocuments();
      if(totalUsers === 0){
        newUser = await User.create({...req.body, role: 'Admin', allowedRoutes: ['dashboard', 'users', 'contact us', 'orders', 'products', 'blogs', 'coupon']});
      }
      else{
        const sendData = 
        `
        <div style="width:100">
         <span>Dear ${req.body.name || "Customer"}</span>
         <p>Welcome to KFS FITNESS FAMILY! We’re delighted that you’ve chosen to join our community. Whether you're here to explore our products, services, or simply stay informed, we’re committed to making your experience with us truly exceptional.</p>
         <p>If you have any questions or need assistance, our support team is here for you! Contact us at info@kfsfitness.com.</p>
         <p>Thanks again for choosing us, ${req.body.name}. We’re thrilled to be part of your journey and can’t wait to help you achieve your goals!</p>
        <div>
        <p> Best regards</p>
        <p>KFS FITNESS TEAM</p>
        <a href="https://kfsecommerce.deepmart.shop/">Visit KFS FITNESS</a>
       </div>
        </div>
        `;
        const data = {
          to: email,
          subject: `Welcome to KFS FITNESS ${req.body?.name || "Customer"} - Registration Successful!`,
          html: sendData,
        };
        sendEmail(data);
        newUser = await User.create(req.body);
      }
      res.status(200).json(newUser);
    } catch (error) {
      mongooseError(error, res);
    }
  } else {
    res.status(406);
    throw new Error("You are already registered with us !");
  }
});

const isAdminuser = asyncHandler(async (req, res) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email });
  if (adminUser.role !== "admin") {
    throw new Error("You are not an admin");
  } else {
    res.json({ admin: true });
  }
});

// Login a user
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findUser = await User.findOne({ email });
  if (findUser) {
    if (findUser && (await findUser.isPasswordMatched(password))) {
      const refreshToken = await generateRefreshToken(findUser?._id);
      if (findUser.isBlocked === false) {
        const updateuser = await User.findByIdAndUpdate(
          findUser.id,
          {
            refreshToken: refreshToken,
          },
          { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 72 * 60 * 60 * 1000,
        });

        res.json({
          _id: findUser?._id,
          name: findUser?.name,
          email: findUser?.email,
          mobile: findUser?.mobile,
          token: generateToken(findUser?._id),
          role: findUser?.role,
          cart: findUser?.cart,
          address: findUser?.address,
          allowedRoute :findUser?.allowedRoutes
        });
      } else {
        res.status(403).send({ message: "you are blocked by Admin" });
      }
    } else {
      res.status(401).send({ message: "Invalid Credentials" });
    }
  } else {
    res.status(201).json("User not Found");
  }
});

// Login a user with mobile no.
const loginUserWithMobile = asyncHandler(async (req, res) => {
  const { mobile } = req.body;
  const user = await User.findOne({ mobile });
  if (!user) {
    return res.status(401).json({
      status: 404,
      success: false,
      message: "User doesn't exist",
    });
  }

  // Send OTP to mobile
  let otp = '';
  const isExistingOtp = await OTP.findOne({ mobile });
  if (isExistingOtp) {
    otp = isExistingOtp.otp;
  }
  else {
    otp = randomstring.generate({
      length: 4,
      charset: "numeric",
    });
    await OTP.create({ mobile, otp });
  }

  const message = `${otp} is your one-time password (OTP) to create your ITSYBIZZ account. Please enter the OTP to proceed.`;

  let options = {
    url: `${process.env.SEND_SINGLE_MSG_API}UserID=${process.env.API_KEY}&Password=${process.env.API_SECRET}&SenderID=${process.env.SENDER_ID}&Phno=${mobile}&EntityID=${process.env.ENTITY_ID}&TemplateID=${process.env.TEMPLATE_ID}&Msg=${message}`,
    headers: { "content-type": "application/x-www-form-urlencoded" },
  };

  request.post(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      return res.status(200).json({
        status: 200,
        success: true,
        message: "OTP has been sent to your mobile no.",
      });
    }
    else {
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Something went wrong",
      });
    }
  });
});

const loginWithAccessToken = asyncHandler(async (req, res)=>{
  const {token} = req.body;

  if(!token){
    return res.status(401).json({
      status: 401,
      success: false,
      message: 'Session expired!'
    })
  }

  try{
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const id = verified.id;
    const role = verified.role;

    const user = await User.findById(id).select('-password -gstNo -panNo');
    if(!user){
      return res.status(404).json({
        status: 404,
        success: false,
        message: "User not found"
      });
    }

    const newToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3d" });

    return res.status(200).json({
      status: 200,
      success: true,
      user: user._doc,
      allowedRoutes: user?.allowedRoutes,
      token: newToken,
      message: 'Logged in successfully'
    });
  }
  catch(err){
    return res.status(401).json({
      status: 401,
      success: false,
      message: err?.message || 'Session expired'
    })
  }
})
// admin login

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateuser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
      super: findAdmin,
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});
const addnewAddress = asyncHandler(async (req, res, next) => {
  const { _id } = req?.user;
  validateMongoDbId(_id);

  try {
    // Check if address already exists in Address schema
    const existingAddress = await Address.findOne(req.body);

    if (existingAddress) {
      const user = await User.findById(_id);
      const existingUserAddress = user.address.find(
        (address) => address.toString() === existingAddress._id.toString()
      );

      if (existingUserAddress) {
        const response = {
          success: true,
          message: "Address saved successfully",
        };
        return res.json(response);
      }

      // If address already exists, update user's address and send response
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
          $push: { address: existingAddress._id },
        },
        {
          new: true,
        }
      );

      const response = {
        success: true,
        message: "Address saved successfully",
        user: updatedUser,
      };
      // return res.json(response);
      const re=  res.json(response);
    }

    // If address does not exist, create and save new address
    const newAddress = await Address.create(req.body);

    // Check if address already exists in User's address array
    const user = await User.findById(_id);
    const existingUserAddress = user.address.find(
      (address) => address.toString() === newAddress._id.toString()
    );

    if (existingUserAddress) {
      const response = {
        success: true,
        message: "Address saved successfully",
      };
      return res.json(response);
    }

    // If address does not exist in User's address array, push it to the array
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        $push: { address: newAddress._id },
      },
      {
        new: true,
      }
    );

    const response = {
      success: true,
      message: "Address saved successfully",
      user: updatedUser,
    };
    res.json(response);
  } catch (error) {
    throw new Error(error);
  }
});

// getaddrss by id
const getAddressById = asyncHandler(async (req, res) => {
  // const { id } = req.params; // id represents the address ID
  const { _id: userId } = req.user;

  try {
    // Query the database to retrieve the user by userId and the specific address by address id
    const user = await User.findById(userId).populate({
      path: "address",
      model: "Address",
      select: "name address city state zipcode mobile", // Select specific address fields
    });

    if (!user || !user.address) {
      return res.status(404).json({ error: "Address not found" });
    }
    // Return the address data
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// delete old address
const deleteAddress = asyncHandler(async (req, res) => {
  try {
    // Extract address ID from request parameters
    const { id } = req.params; // assuming addressId is passed as a URL parameter

    if (!id) {
      return res.status(400).json({ message: "Address ID is required" });
    }

    // Find the address by ID to get the associated user ID
    const address = await Address.findById(id);
    
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    
    // Remove the address from the associated user's addresses array
    await User.findByIdAndUpdate(address.userId, {
      $pull: { address: id }  // Assuming 'addresses' is an array of address IDs in the User model
    });
    // Remove the address from the Address collection
    const deletedAddress = await Address.findByIdAndDelete(id);

    if (!deletedAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

   
    res.status(200).json({ message: "Address deleted successfully", deletedAddress });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

// logout functionality

const logout = asyncHandler(async (req, res) => {
  if (!req.cookies?.refreshToken)
    throw new Error("No Refresh Token in Cookies");
  const refreshToken = req.cookies.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});

// Update a user

const updatedUser = asyncHandler(async (req, res) => {
  // console.log(req.body);
  // console.log(req.user);
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    // Fetch the current user details
    const currentUser = await User.findById(_id);

    // Prepare update fields only if they are provided in the request body
    const updateFields = {};

    if (req?.body?.name) {
      updateFields.name = req.body.name;
    }
    if (req?.body?.email) {
      updateFields.email = req.body.email;
    }
    if (req?.body?.mobile) {
      updateFields.mobile = req.body.mobile;
    }

    // Check and update gstNo if it does not exist and is provided
    if (!currentUser.gstNo && req?.body?.gstNo) {
      updateFields.gstNo = req.body.gstNo;
    }

    // Check and update panNo if it does not exist and is provided
    if (!currentUser.panNo && req?.body?.panNo) {
      updateFields.panNo = req.body.panNo;
    }

    // Perform the update operation
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $set: updateFields },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});



const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // if (!validateMongoDbId(id)) {
  //   throw new Error('Invalid MongoDB ID');
  // }
  try {
    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });

    return res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user role' });
  }
});

const updateAccess = asyncHandler(async (req, res)=>{
  const {id, allowedRoutes} = req.body;

  const user = await User.findById(id);
  if(!user){
    return res.status(404).json({
      status: 404,
      success: false,
      message: 'User not found'
    })
  }
  if(user.role === 'Employee'){
    const updatedUser = await User.findByIdAndUpdate(id, {allowedRoutes}, {new: true});

    return res.status(200).json({
      status: 200,
      success: true,
      message: 'Employee access updated successfully'
    })
  }

  res.status(400).json({
    status: 400,
    success: false,
    message: 'The user is not an employee'
  })
})

// save user Address

// Get all users
const getallUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find()
      .populate("address")
      .populate({
        path: "order",
        model: "Order",
        select: "orderId amount cartItems",
      });

    // Log the results to verify population
    // console.log("Populated users with orders:", getUsers);

    res.json(getUsers);
  } catch (error) {
    console.error("Error populating orders:", error);
    throw new Error(error);
  }
});


// Get a single user
const getaUser = async (req, res) => {
  try {
    const _id = req.params.id; // Or you can use req.params.id if you're passing the ID in the URL
    const user = await User.findById(_id).populate("address").populate("order"); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving user", error });
  }
};


// Get a single user

const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (deletedUser) {
      res.json({ success: true, message: "user deleted sucessfully", id });
    } else {
      res.json({ success: false, message: "User doesn't exist", id });
    }
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const blockusr = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json(blockusr);
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User UnBlocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});
const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

//Reset The Password
const forgetPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) res.json({ error: "Email is not Registered with us !" });
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const sendData = `<h1 style=\"color: #333; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; margin-bottom: 16px;\">Password Reset<\/h1>\r\n<p style=\"color: #666; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 8px;\">Hi there,<\/p>\r\n<p style=\"color: #666; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 16px;\">We received a request to reset your password. Please click the link below to reset your password:<\/p>\r\n<p style=\"margin-bottom: 16px;\"><a href='${req.headers.origin}/reset-password/${token}' style=\"background-color: #007bff; border-radius: 4px; color: #fff; display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; padding: 10px 16px; text-decoration: none;\">Reset Password<\/a><\/p>\r\n<p style=\"color: #666; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 16px;\">If you did not request a password reset, you can ignore this email and your password will not be changed.<\/p>\r\n<p style=\"color: #666; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;\">Thank you,<\/p>\r\n<p style=\"color: #666; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 0;\">KFS Fitness Team<\/p>\r\n`;
    const data = {
      to: email,
      subject: "Password Reset Link from KFS Fitness",
      html: sendData,
    };
    sendEmail(data);
    res.json(token);
  } catch (err) { }
});
const checkresetPasswordUser = asyncHandler(async (req, res) => {
  const token = req.params.token;
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return res.json({ error: "Token  Expired Please Try again" });
  }
  res.json(user.email);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const token = req.params.token;
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) res.json({ error: "Token  Expired Please Try again" });
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();
  res.json("Password has been changed Sucessfully");
});

// getAllOrders()

module.exports = {
  createUser,
  loginUserCtrl,
  getallUser,
  getaUser,
  deleteaUser,
  updatedUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgetPasswordToken,
  resetPassword,
  loginAdmin,
  updateRole,
  isAdminuser,
  checkSignup,
  checkresetPasswordUser,
  verifyUser,
  addnewAddress,
  getAddressById,
  loginUserWithMobile,
  loginWithAccessToken,
  updateAccess,
  deleteAddress
};
