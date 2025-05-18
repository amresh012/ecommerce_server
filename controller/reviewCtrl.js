const Product = require("../models/productModel")


const createProductReview = async (req, res) => {
  const { rating, review, title } = req.body;
 
  const product = await Product.findById(req.params.productId);
  if (product) {
    // If the user has already reviewed this product, throw an error
    const reviewedAlready = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
    if (reviewedAlready) {
      res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const newReview = {
      title: title,
      user: req.user._id,
      rating: rating,
      review: review
    };

    // store the new review and update the rating of this product
    product.reviews.push(newReview);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, ele) => acc + ele.rating, 0) /
      product.numReviews.toFixed(1);
    const updatedProduct = await product.save();
    if (updatedProduct)
      return res.status(200).json({ success: true, message: "Review Added" });
  } else {
     res.status(404);
    throw new Error("Product not available");
  }
};

const getProductReviews = async (req, res) => {
  const product = await Product.findById(req.params.productId).populate({
    path: "reviews",
    populate: [{
      path: "user",
      model:"User",
      select: "name"
    }]
  });

  if (product) {
   return  res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } else {
   return  res.status(404).json({ success: false, message: "Product not found" });
  }
};

const updateProductReview = async (req, res) => {
  const { rating, review, title } = req.body;
  const product = await Product.findById(req.params.productId);

  if (product) {
    const existingReview = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      existingReview.title = title ||existingReview.title;
      existingReview.rating = rating || existingReview.rating;
      existingReview.review = review || existingReview.review;

      product.rating =
        product.reviews.reduce((acc, ele) => acc + ele.rating, 0) / product.numReviews;

      await product.save();
    return   res.status(200).json({ success: true, message: "Review updated" });
    } else {
     return  res.status(400).json({
        success: false,
        message: "You haven't reviewed this product",
      });
    }
  } else {
   return  res.status(404).json({ success: false, message: "Product not found" });
  }
};

const deleteProductReview = async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (product) {
    const reviewIndex = product.reviews.findIndex(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (reviewIndex !== -1) {
      product.reviews.splice(reviewIndex, 1);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.length === 0
          ? 0
          : product.reviews.reduce((acc, ele) => acc + ele.rating, 0) / product.numReviews;

      await product.save();
      res.status(200).json({ success: true, message: "Review deleted" });
    } else {
       res.status(400).json({
        success: false,
        message: "You haven't reviewed this product",
      });
    }
  } else {
     res.status(404).json({ success: false, message: "Product not found" });
  }
};


// admin delete review
const adminDeleteProductReview = async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (product) {
    const reviewIndex = product.reviews.findIndex(
      (rev) => rev._id.toString() === req.params.reviewId
    );

    if (reviewIndex !== -1) {
      product.reviews.splice(reviewIndex, 1);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.length === 0
          ? 0
          : product.reviews.reduce((acc, ele) => acc + ele.rating, 0) / product.numReviews;

      await product.save();
      return res.status(200).json({ success: true, message: "Review deleted by admin" });
    } else {
      res.status(404).json({ success: false, message: "Review not found" });
    }
  } else {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
};


// like a review
const likeReview = async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (product) {
    const review = product.reviews.id(req.params.reviewId);

    if (review) {
      // Check if the user has already liked the review
      const hasLiked = review.likes.includes(req.user._id);
      if (hasLiked) {
         res.status(400).json({ success: false, message: "You've already liked this review" });
      }

      // Remove dislike if the user has disliked the review before
      review.dislikes = review.dislikes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );

      // Add user to likes
      review.likes.push(req.user._id);

      await product.save();
       res.status(200).json({ success: true, message: "Review liked" , likes : review?.likes?.length });
    } else {
      res.status(404).json({ success: false, message: "Review not found" });
    }
  } else {
   res.status(404).json({ success: false, message: "Product not found" });
  }
};


// dislike a review
const dislikeReview = async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (product) {
    const review = product.reviews.id(req.params.reviewId);

    if (review) {
      // Check if the user has already disliked the review
      const hasDisliked = review.dislikes.includes(req.user._id);
      if (hasDisliked) {
        return res.status(400).json({ success: false, message: "You've already disliked this review" });
      }

      // Remove like if the user has liked the review before
      review.likes = review.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );

      // Add user to dislikes
      review.dislikes.push(req.user._id);

      await product.save();
      return  res.status(200).json({ success: true, message: "Review disliked",dislike:review?.dislikes?.length });
    } else {
      res.status(404).json({ success: false, message: "Review not found" });
    }
  } else {
    return  res.status(404).json({ success: false, message: "Product not found" });
  }
};

// remove a like
const removeLike = async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (product) {
    const review = product.reviews.id(req.params.reviewId);

    if (review) {
      // Check if the user has liked the review
      const hasLiked = review.likes.includes(req.user._id);
      if (!hasLiked) {
        return res.status(400).json({ success: false, message: "You haven't liked this review" });
      }

      // Remove like
      review.likes = review.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );

      await product.save();
      res.status(200).json({ success: true, message: "Like removed" });
    } else {
      return  res.status(404).json({ success: false, message: "Review not found" });
    }
  } else {
    return  res.status(404).json({ success: false, message: "Product not found" });
  }
};

// remove dislike
const removeDislike = async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (product) {
    const review = product.reviews.id(req.params.reviewId);

    if (review) {
      // Check if the user has disliked the review
      const hasDisliked = review.dislikes.includes(req.user._id);
      if (!hasDisliked) {
       return res.status(400).json({ success: false, message: "You haven't disliked this review" });
      }

      // Remove dislike
      review.dislikes = review.dislikes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );

      await product.save();
      res.status(200).json({ success: true, message: "Dislike removed" });
    } else {
      return  res.status(404).json({ success: false, message: "Review not found" });
    }
  } else {
    return  res.status(404).json({ success: false, message: "Product not found" });
  }
};




module.exports = { 
  createProductReview ,
   getProductReviews,
   updateProductReview,
   deleteProductReview,
   adminDeleteProductReview,
   likeReview,
   dislikeReview,
   removeLike,
   removeDislike

  };