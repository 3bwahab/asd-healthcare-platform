const express = require("express");

const {
  createDoctor,
  getAllDoctors,
  getSpecificDoctor,
  updateSpecificDoctor,
  deleteSpecificDoctor,
  deleteAllDoctor,
  getLoggedDoctorData,
  updateLoggedDoctorData,
  updateLoggedDoctorPassword,
  deleteLoggedDoctorData,
  activateLoggedDoctorData,
  uploadDoctorMedicalLicense,
  pdfName,
  uploadToCaloud,
  uploadDoctorImage,
} = require("../services/doctorServices");

const reviewRoute = require("./reviewRoutes");

const {
  createDoctortValidator,
  getDoctorValidaotr,
  updateDoctorValidaotr,
  deleteDoctorValidaotr,
  changeLoggedDoctorPasswordValidator,
} = require("../utils/validator/doctorValidator");

const AuthServices = require("../services/authServices");

const router = express();

//* Nested Route
router.use("/:doctorId/reviews", reviewRoute);

//*Protect doctor route
router
  .route("/getdoctorData")
  .get(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    getLoggedDoctorData
  );

router
  .route("/updateMypassword")
  .put(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    changeLoggedDoctorPasswordValidator,
    updateLoggedDoctorPassword
  );

router
  .route("/updateMe")
  .put(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    uploadDoctorImage,
    uploadToCaloud,
    updateLoggedDoctorData
  );

router
  .route("/deleteMe")
  .put(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    deleteLoggedDoctorData
  );

router
  .route("/activeMe")
  .put(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    activateLoggedDoctorData
  );

//*------------------------
//*admin
// router.use(AuthServices.protectForUser, AuthServices.allowedTo("admin"));

router
  .route("/")
  .post(
    uploadDoctorMedicalLicense,
    pdfName,
    createDoctortValidator,
    createDoctor
  )
  .get(getAllDoctors)
  .delete(deleteAllDoctor);
router
  .route("/:id")
  .get(getDoctorValidaotr, getSpecificDoctor)
  .put(updateDoctorValidaotr, updateSpecificDoctor)
  .delete(deleteDoctorValidaotr, deleteSpecificDoctor);

module.exports = router;
