const { check } = require("express-validator");

const validatorMiddlware = require("../../middlware/validatorMiddlware");
const bcrypt = require("bcryptjs");
const Parent = require("../../models/parentModel");

exports.createDoctortValidator = [
  check("speciailization")
    .notEmpty()
    .withMessage("Doctor Speciailization Required.."),
  check("qualifications")
    .notEmpty()
    .withMessage("Doctor Qualifications Required.."),

  check("medicalLicense")
    .notEmpty()
    .withMessage("Doctor Medical License Required..."),

  check("address").notEmpty().withMessage("Doctor Address Required.."),

  check("Session_price")
    .notEmpty()
    .withMessage("Doctor Session Price Required.."),
  validatorMiddlware,
];

exports.getDoctorValidaotr = [
  check("id").isMongoId().withMessage("Invalid Id Format.."),
  validatorMiddlware,
];

exports.updateDoctorValidaotr = [
  check("id").isMongoId().withMessage("Invalid Id Format.."),
  validatorMiddlware,
];

exports.deleteDoctorValidaotr = [
  check("id").isMongoId().withMessage("Invalid Id Format.."),
  validatorMiddlware,
];

exports.changeLoggedDoctorPasswordValidator = [
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
      const parent = await Parent.findOne(req.doctor.parent);
      if (!parent) {
        throw new Error(`There is no parent for this id:${req.doctor.parent}`);
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
