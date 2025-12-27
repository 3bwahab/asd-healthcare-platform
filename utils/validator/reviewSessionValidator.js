const { check } = require("express-validator");

const validatorMiddlware = require("../../middleware/validatorMiddleware");

exports.createReviewSessionValidator = [
  check("title").notEmpty().withMessage("Review Session Title  Required.."),
  check("ratings").notEmpty().withMessage("Review Session Ratings Required.."),
  validatorMiddlware,
];

// exports.deleteSessionValidator = [
//   check("id").isMongoId().withMessage("Invalid ID Format"),
//   validatorMiddlware,
// ];
