const express = require("express");

const {
  addReviewToSession,
  getAllReviewOnSpecificSession,
  removeReviewFromSession,
} = require("../services/sessionReviewServices");

const {
  createReviewSessionValidator,
} = require("../utils/validator/reviewSessionValidator");

const AuthServices = require("../services/authServices");

const router = express.Router();

// router.use(
//   AuthServices.protectForParent,
//   AuthServices.allowedToParent("parent")
// );

router
  .route("/:sessionId")
  .post(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    createReviewSessionValidator,
    addReviewToSession
  )
  .get(getAllReviewOnSpecificSession)
  .delete(removeReviewFromSession);

module.exports = router;
