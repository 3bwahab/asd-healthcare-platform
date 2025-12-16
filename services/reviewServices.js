const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const Review = require("../models/reviewModel");
const factory = require("./handlersFactory");

//* Nested route
exports.setDoctorIdToBody = (req, res, next) => {
  if (!req.body.doctor) req.body.doctor = req.params.doctorId;
  if (!req.body.parent) req.body.parent = req.parent._id;
  next();
};
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.doctorId) filterObject = { doctor: req.params.doctorId };
  req.filterObj = filterObject;
  next();
};
//*----------------------
/**
 * Create Review
 * @router Post /api/v1/Reviews
 * @access private/Review
 */

//--updated
exports.createReview = asyncHandler(async (req, res) => {
  const review = await Review.create({
    title: req.body.title,
    ratings: req.body.ratings,
    parent: req.parent._id,
    doctor: req.body.doctor,
    date: Date.now(),
  });

  res.status(200).json({ data: review });
});
/**
 * Get All Review
 * @router Post /api/v1/Reviews
 * @access private/Review
 */

exports.getAllReviews = factory.getAll(Review);
/**
 * Get Specific Review
 * @router Post /api/v1/Reviews/:id
 * @access private/Review
 */

exports.getSpecificReviews = factory.getOne(Review);
/**
 * Update Specific Review
 * @router Put /api/v1/Reviews/:id
 * @access private/Review
 */

exports.updateSpecificReviews = factory.updateOne(Review);

/**
 * Delete Specific Review
 * @router delete /api/v1/Reviews/:id
 * @access private/Review
 */

exports.deleteSpecificReviews = factory.deleteOne(Review);
