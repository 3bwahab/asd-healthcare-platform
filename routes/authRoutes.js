const express = require("express");

const {
  singupForParent,
  forgotPassword,
  verifyPasswordResetCode,
  resetPasseword,
  verifyEmailResetCode,
  protectForParent,
  singupForDoctor,
  pdfName,
  uploadDoctorMedicalLicense,
  login,
  resendResetCode,
  resendEmailResetCode,
} = require("../services/authServices");

const {
  singupForParentValidator,
  singupForDoctorValidator,
} = require("../utils/validator/authValidator");

const router = express();

router
  .route("/singupForParent")
  .post(singupForParentValidator, singupForParent);
router.route("/verifyemail").post(verifyEmailResetCode);
router.route("/forgotPassword").post(forgotPassword, resendResetCode);
router.route("/verifyPassword").post(verifyPasswordResetCode);
router.route("/resetPasseword").post(resetPasseword);
router.route("/resend-reset-code").post(protectForParent, resendEmailResetCode);

//*  Doctor *******
router
  .route("/singupForDoctor")
  .post(
    protectForParent,
    uploadDoctorMedicalLicense,
    pdfName,
    singupForDoctorValidator,
    singupForDoctor
  );
router.route("/login").post(login);

module.exports = router;
