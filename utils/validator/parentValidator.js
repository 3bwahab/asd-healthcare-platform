const { check } = require("express-validator");
const bcrypt = require("bcryptjs");

const validatorMiddlware = require("../../middlware/validatorMiddlware");
const Parent = require("../../models/parentModel");

exports.createParentValidator = [
  check("userName")
    .notEmpty()
    .withMessage("user name required..")
    .isLength({ max: 20 })
    .withMessage("Too long user name"),

  check("email")
    .notEmpty()
    .withMessage("Email is required..")
    .isEmail()
    .withMessage("Invalid Email Format")
    .custom(async (val) => {
      const parent = await Parent.findOne({ email: val });
      if (parent) {
        throw new Error(" Email exist please write another email..");
      }
    }),

  check("phone")
    .notEmpty()
    .withMessage("Phone is required..")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invaild Phone Number Only Egy _ SA Phone Numbers"),

  check("address").notEmpty().withMessage("Address is required.."),

  check("password").notEmpty().withMessage("Password is required.."),
  check("confirmPassword")
    .notEmpty()
    .withMessage("Password Confirm is required..")
    .custom((val, { req }) => {
      if (val != req.body.password) {
        return Promise.reject(new Error("incorrect password confirmation.."));
      }
      return true;
    }),

  check("age").notEmpty().withMessage("Age is Required..").isNumeric(),

  validatorMiddlware,
];

exports.geteParentValidator = [
  check("id").isMongoId().withMessage("Invalid user id"),
  validatorMiddlware,
];
exports.updateParentValidator = [
  check("id").isMongoId().withMessage("Invalid parent id"),
  check("userName").optional(),

  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid Email Format")
    .custom(async (val) => {
      const parent = await Parent.findOne({ email: val });
      if (parent) {
        throw new Error(" Email exist please write another email..");
      }
    }),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invaild Phone Number Only Egy _ SA Phone Numbers"),
  check("age").notEmpty().withMessage("Age is Required..").isNumeric(),
  check("address").notEmpty().withMessage("Address is required.."),
];

exports.changePasswordValidator = [
  check("id").isMongoId().withMessage("Invalid parent id"),

  check("currentPassword")
    .notEmpty()
    .withMessage("Current Password is required.."),

  check("confirmPassword")
    .notEmpty()
    .withMessage("Password Confirm is required.."),

  check("password")
    .notEmpty()
    .withMessage("Password is required..")
    .custom(async (val, { req }) => {
      //*1-Verify current password
      const parent = await Parent.findById(req.params.id);
      if (!parent) {
        throw new Error(`There is no parent for this id:${req.params.id}`);
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        parent.password
      );
      if (!isCorrectPassword) {
        throw new Error(`Current Password Incorrect`);
      }
      //*2-verify Password confirm
      if (val != req.body.confirmPassword) {
        throw new Error("Confirm Password Incorrect");
      }
    }),

  validatorMiddlware,
];

exports.deleteParentValidator = [
  check("id").isMongoId().withMessage("Invalid user id"),
  validatorMiddlware,
];

exports.changeLoggedParentPasswordValidator = [
  check("currentPassword")
    .notEmpty()
    .withMessage("Current Password is required.."),

  check("confirmPassword")
    .notEmpty()
    .withMessage("Password Confirm is required.."),

  check("password")
    .notEmpty()
    .withMessage("Password is required..")
    .custom(async (val, { req }) => {
      //*1-Verify current password
      const parent = await Parent.findById(req.parent._id);
      if (!parent) {
        throw new Error(`There is no parent for this id:${req.parent._id}`);
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        parent.password
      );
      if (!isCorrectPassword) {
        throw new Error(`Current Password Incorrect`);
      }
      //*2-verify Password confirm
      if (val != req.body.confirmPassword) {
        throw new Error("Confirm Password Incorrect");
      }
    }),

  validatorMiddlware,
];

exports.updateLoggedParentDataValidator = [
  check("userName").optional(),

  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid Email Format")
    .custom(async (val) => {
      const parent = await Parent.findOne({ email: val });
      if (parent) {
        throw new Error(" Email exist please write another email..");
      }
    }),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invaild Phone Number Only Egy _ SA Phone Numbers"),

  check("age").notEmpty().withMessage("Age is Required..").isNumeric(),
  check("address").notEmpty().withMessage("Address is required.."),
];
