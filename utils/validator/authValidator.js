const { check } = require("express-validator");

const validatorMiddlware = require("../../middleware/validatorMiddleware");
const Parent = require("../../models/parentModel");

exports.singupForParentValidator = [
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

  check("password")
    .notEmpty()
    .withMessage("Password is required..")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  check("confirmPassword")
    .notEmpty()
    .withMessage("Password Confirm is required..")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        return Promise.reject(new Error("incorrect password confirmation.."));
      }
      return true;
    }),

  check("age").notEmpty().withMessage("Age is required.."),
  check("address").notEmpty().withMessage("Address is required.."),

  validatorMiddlware,
];

exports.singupForDoctorValidator = [
  check("speciailization")
    .notEmpty()
    .withMessage("Doctor Speciailization Required.."),
  check("qualifications")
    .notEmpty()
    .withMessage("Doctor Qualifications Required.."),

  check("medicalLicense")
    .notEmpty()
    .withMessage("Doctor Medical License Required.."),

  check("address").notEmpty().withMessage("Doctor Address Required.."),

  check("Session_price")
    .notEmpty()
    .withMessage("Doctor Session Price Required.."),

  validatorMiddlware,
];
