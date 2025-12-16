const { check } = require("express-validator");

const validatorMiddlware = require("../../middlware/validatorMiddlware");
const Parent = require("../../models/parentModel");
const Review = require("../../models/reviewModel");

exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("Review Rating Required..")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Review Value Must Be Between 1 and 5"),

  check("parent")
    .isMongoId()
    .withMessage("Invalid Parent ID Format")
    .custom(async (val, { req }) => {
      const parent = await Parent.findById(val);
      if (!parent) {
        throw new Error(`Ther is no parnet for this id:${val}`);
      }
    }),

  check("doctor")
    .isMongoId()
    .withMessage("Invalid Parent ID Format")
    .custom(async (val, { req }) => {
      const review = await Review.findOne({
        parent: req.parent._id,
        doctor: req.body.doctor,
      });
      if (review) {
        throw new Error("you already created review before");
      }
    }),

  validatorMiddlware,
];

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format"),
  validatorMiddlware,
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid ID Format")
    .custom(async (val, { req }) => {
      const review = await Review.findById(val);
      if (!review) {
        throw new Error(`There is no Review For this id: ${val}`);
      }
      if (review.parent._id.toString() !== req.parent._id.toString()) {
        throw new Error("You are not allow to perform this action");
      }
    }),
  validatorMiddlware,
];
exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid ID Format")
    .custom(async (val, { req }) => {
      const review = await Review.findById(val);
      if (!review) {
        throw new Error(`There is no Review For this id: ${val}`);
      }
      const parent = await Parent.findById(req.parent._id);

      if (parent.role === "parent") {
        if (review.parent._id.toString() !== req.parent._id.toString()) {
          throw new Error("You are not allow to perform this action");
        }
      }
    }),
  validatorMiddlware,
];
