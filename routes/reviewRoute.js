const express = require("express");
const { 
  createProductReview,
  getProductReviews,
   updateProductReview,
   deleteProductReview,
   adminDeleteProductReview,
   likeReview,
   dislikeReview,
   removeLike,
   removeDislike
 } = require("../controller/reviewCtrl"); // Import the controller
const {authMiddleware,isAdmin, checkAccess} = require("../middlewares/authMiddleware")

const router = express.Router();

// Route to add a new review
router.post("/:productId",authMiddleware, createProductReview);

// Route to get all reviews for a product
router.get(
  "/:productId",
  getProductReviews
);

// Route to update a review
router.put("/:productId",authMiddleware, updateProductReview);

// Route to delete a review
router.delete("/:productId/:reviewId",authMiddleware, deleteProductReview);

// Like a review
router.post('/:productId/:reviewId/like',authMiddleware, likeReview);

// Dislike a review
router.post('/:productId/:reviewId/dislike',authMiddleware, dislikeReview);

// Remove a like
router.delete('/:productId/:reviewId/unlike',authMiddleware, removeLike);

// Remove a dislike
router.delete('/:productId/:reviewId/undislike',authMiddleware, removeDislike)

// Admin can delete any review
router.delete('/:productId/:reviewId/admin',authMiddleware, isAdmin,checkAccess,adminDeleteProductReview)

module.exports = router;
