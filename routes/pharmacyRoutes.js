const express = require("express");

const {
  createPharmacy,
  getAllPharmacys,
  getSpecificPharmacy,
  updateSpecificPharmacy,
  deleteSpecificPharmacy,
} = require("../services/pharmacyServices");

const {
  createPharmacyValidator,
  deletePharmacyValidator,
  getPharmacyValidator,
  updatePharmacyValidator,
} = require("../utils/validator/pharmacyValidator");

const AuthServices = require("../services/authServices");

const router = express.Router();
router.use(
  AuthServices.protectForParent,
  AuthServices.allowedToParent("parent")
);

router
  .route("/")
  .post(createPharmacyValidator, createPharmacy)
  .get(getAllPharmacys);
router
  .route("/:id")
  .get(getPharmacyValidator, getSpecificPharmacy)
  .put(updatePharmacyValidator, updateSpecificPharmacy)
  .delete(deletePharmacyValidator, deleteSpecificPharmacy);

module.exports = router;
