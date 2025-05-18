const express = require("express");
const {
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
  deleteAddress,
  loginUserWithMobile,
  loginWithAccessToken,
  updateAccess

} = require("../controller/userCtrl");
const {
  authMiddleware,
  isAdmin,
} = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/check", checkSignup);
router.post("/verify", verifyUser);
router.post("/register",createUser);
router.get("/isadmin",authMiddleware,isAdminuser);
router.post("/forgot-password-token", forgetPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.get("/reset-password/:token", checkresetPasswordUser);
router.put("/password", authMiddleware, updatePassword);
router.post("/login", loginUserCtrl);
router.post("/login-with-access-token", loginWithAccessToken);
router.post("/login-with-mobile", loginUserWithMobile);
router.post("/adr", authMiddleware, addnewAddress);
router.post("/adr/:id", authMiddleware, getAddressById);
router.delete("/adr/delete/:id", authMiddleware, deleteAddress);
router.post("/admin-login", loginAdmin);
router.get("/all-users", getallUser);
router.get("/refresh", handleRefreshToken);
router.post("/logout", logout);
router.get("/:id", authMiddleware, getaUser);
router.delete("/:id", deleteaUser);
router.put("/order/update-order/:id", authMiddleware);
router.put("/edit-user",authMiddleware, updatedUser);
router.put("/edit-role/:id", authMiddleware, isAdmin,  updateRole);
router.post("/edit-access/", authMiddleware, isAdmin,  updateAccess);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id",authMiddleware, isAdmin, unblockUser);

module.exports = router;
