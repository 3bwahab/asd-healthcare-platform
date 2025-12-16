const { check } = require("express-validator");
const Pharamcy = require("../../models/pharmacyModel");

const validatorMiddlware = require("../../middlware/validatorMiddlware");

exports.createMedicanValidator = [
  check("medican_name").notEmpty().withMessage("Medican Name Required.."),
  check("medican_info").notEmpty().withMessage("Medican Info Required.."),
  check("medican_image").notEmpty().withMessage("Medican Image Required.."),
  check("pharmacy")
    .notEmpty()
    .withMessage("Pharmacy id Required..")
    .custom(async (val, { req }) => {
      const pharmacy = await Pharamcy.findById(val);
      if (!pharmacy) {
        throw Error(`The medican must belong to valid pharmacy id ${val}`);
      }
    }),
  check("ratings").optional(),
  validatorMiddlware,
];

exports.getMedicanValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format"),
  validatorMiddlware,
];

exports.updateMedicanValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format"),
  validatorMiddlware,
];
exports.deleteMedicanValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format"),
  validatorMiddlware,
];
