const { check } = require("express-validator");
const validatorMiddleware = require("../../middlware/validatorMiddlware");

exports.createCharityValidator = [
  check("charity_name").notEmpty().withMessage("Charity name is required"),
  check("charity_address")
    .notEmpty()
    .withMessage("Charity address is required"),
  check("charity_phone").notEmpty().withMessage("Charity phone is required"),
  check("charity_medican").notEmpty().withMessage("Charity medicin is required"),
  
  validatorMiddleware,
];

exports.updateCharityValidator = [
  check("id").isMongoId().withMessage("Invalid charity ID"),
  validatorMiddleware,
];

exports.deleteCharityValidator = [
  check("id").isMongoId().withMessage("Invalid charity ID"),
  validatorMiddleware,
];

exports.getCharityValidator = [
  check("id").isMongoId().withMessage("Invalid charity ID"),
  validatorMiddleware,
];
