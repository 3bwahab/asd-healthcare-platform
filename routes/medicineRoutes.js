const express = require("express");

const {
  createMedican,
  getAllMedicans,
  getSpecificMedican,
  updateSpecificMedican,
  deleteSpecificMedican,
  uploadToCaloud,
  uploadMedicanImage,
} = require("../services/medicineServices");

const {
  createMedicanValidator,
  deleteMedicanValidator,
  getMedicanValidator,
  updateMedicanValidator,
} = require("../utils/validator/medicineValidator");

const AuthServices = require("../services/authServices");

const router = express.Router();
router.use(
  AuthServices.protectForParent,
  AuthServices.allowedToParent("parent")
);

router
  .route("/")
  .post(
    uploadMedicanImage,
    uploadToCaloud,
    createMedicanValidator,
    createMedican
  )
  .get(getAllMedicans);
router
  .route("/:id")
  .get(getMedicanValidator, getSpecificMedican)
  .put(
    uploadMedicanImage,
    uploadToCaloud,
    updateMedicanValidator,
    updateSpecificMedican
  )
  .delete(deleteMedicanValidator, deleteSpecificMedican);

module.exports = router;
