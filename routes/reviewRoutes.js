const express = require("express");

const {
  createReview,
  deleteSpecificReviews,
  getAllReviews,
  getSpecificReviews,
  updateSpecificReviews,
  createFilterObj,
  setDoctorIdToBody,
} = require("../services/reviewServices");

const {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validator/reviewValidator");

const AuthServices = require("../services/authServices");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    setDoctorIdToBody,
    createReviewValidator,
    createReview
  )
  .get(createFilterObj, getAllReviews);
router
  .route("/:id")
  .get(getReviewValidator, getSpecificReviews)
  .put(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    updateReviewValidator,
    updateSpecificReviews
  )
  .delete(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent", "admin"),
    deleteReviewValidator,
    deleteSpecificReviews
  );

module.exports = router;
