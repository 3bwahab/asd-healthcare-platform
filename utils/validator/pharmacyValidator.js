const { check } = require("express-validator");

const validatorMiddlware = require("../../middlware/validatorMiddlware");
const Pharmacy = require("../../models/pharmacyModel");

exports.createPharmacyValidator = [
  check("p_owner").notEmpty().withMessage("Pharmacy Owner Required.."),
  check("p_name")
    .notEmpty()
    .withMessage("Pharmacy Name Required..")
    .custom(async (val) => {
      const pharmacy = await Pharmacy.findOne({ p_name: val });
      if (pharmacy) {
        throw new Error(`Please choice another name..`);
      }
    }),
  check("p_location").notEmpty().withMessage("Pharmacy Location Required.."),
  check("p_phone")
    .notEmpty()
    .withMessage("Pharmacy Phone Required..")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invaild Phone Number Only Egy _ SA Phone Numbers"),

  validatorMiddlware,
];

exports.getPharmacyValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format"),
  validatorMiddlware,
];

exports.updatePharmacyValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format"),
  validatorMiddlware,
];
exports.deletePharmacyValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format"),
  validatorMiddlware,
];
