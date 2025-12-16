const { check } = require("express-validator");
const Parent = require("../../models/parentModel");

const validatorMiddlware = require("../../middlware/validatorMiddlware");

exports.createEducationValidator = [
  check("title").notEmpty().withMessage("Education title Required.."),
  check("info").notEmpty().withMessage("Education Info Required.."),
  check("image").notEmpty().withMessage("Education Image Required.."),
  check("ratings").optional(),
  validatorMiddlware,
];

exports.getEducationValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format"),
  validatorMiddlware,
];

exports.updateEducationValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format"),
  validatorMiddlware,
];
exports.deleteEducationValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format"),
  validatorMiddlware,
];
