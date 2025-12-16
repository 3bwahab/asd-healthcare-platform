const { check } = require("express-validator");

const validatorMiddlware = require("../../middlware/validatorMiddlware");
const Parent = require("../../models/parentModel");
const Session = require("../../models/SessionModel");

exports.createSessionValidator = [
  check("parentId")
    .isMongoId()
    .withMessage("Invalid ID Format")
    .custom(async (val, { req }) => {
      const parent = await Parent.findById(val);
      if (!parent) {
        throw new Error(`Ther is no parnet for this id:${val}`);
      }
    }),

  check("session_date").notEmpty().withMessage("Session Date Required.."),
  check("session_number")
    .isNumeric()
    .notEmpty()
    .withMessage("Session Number Required..")
    .custom(async (val, { req }) => {
      const session = await Session.findOne({ session_number: val });
      if (session) {
        throw new Error(
          `choise another number of session this number is used.`
        );
      }
    }),

  check("statusOfSession")
    .notEmpty()
    .withMessage("Status Of Session Required.."),

  check("comments").notEmpty().withMessage("Comments Of Session Required.."),

  validatorMiddlware,
];

exports.getSessionValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format"),
  validatorMiddlware,
];

exports.updateSessionValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format"),
  validatorMiddlware,
];
exports.deleteSessionValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format"),
  validatorMiddlware,
];
