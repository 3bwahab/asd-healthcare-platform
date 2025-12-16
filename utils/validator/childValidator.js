const { check } = require("express-validator");

const validatorMiddlware = require("../../middlware/validatorMiddlware");
const Parent = require("../../models/parentModel");
const Child = require("../../models/childModel");

exports.createChildValidator = [
  check("childName")
    .notEmpty()
    .withMessage("Child Name Required..")
    .isLength({ max: 20 })
    .withMessage("Too long Child Name."),
  check("birthday").notEmpty().withMessage("Birthday Required.."),

  check("gender").notEmpty().withMessage("Gender Required.."),
  check("age").notEmpty().withMessage("Age Required.."),

  check("healthDetails").optional(),

  check("image").optional(),

  validatorMiddlware,
];

exports.getChildValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format"),
  validatorMiddlware,
];

exports.updateChildValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format"),

  validatorMiddlware,
];
exports.deleteChildValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid ID Format")
    .custom(async (val, { req }) => {
      const child = await Child.findById(val);
      if (!child) {
        throw new Error(`the is no child for this id ${val}`);
      }

      if (req.parent._id.toString() !== child.parent.toString()) {
        throw new Error(`You are not allow to perform this action`);
      }
    }),
  validatorMiddlware,
];
