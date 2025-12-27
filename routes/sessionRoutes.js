const express = require("express");
const {
  createSession,
  getAllSessions,
  getSpecificSession,
  updateSpecificSession,
  deleteSpecificSession,
  getAllSessionForSpecificParentByStatus,
  getAllSessionForSpecificParent,
  addCommentToSpecificSession,
  getAllSessionForParentToOneDoctor,
  getAllSessionForParentToOneDoctorByStatus,
  getAllSessionsForDoctor,
  getAllSessionsFotDoctorByStatus,
  getAllSessionForSpecificDoctor,
} = require("../services/sessionServices");

const {
  createSessionValidator,
  deleteSessionValidator,
  getSessionValidator,
  updateSessionValidator,
} = require("../utils/validator/sessionValidator");

const AuthServices = require("../services/authServices");

const router = express.Router();

// Create and get all sessions
router
  .route("/")
  .post(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    createSessionValidator,
    createSession
  )
  .get(getAllSessions);

// Specific routes FIRST
router
  .route("/ForParent")
  .get(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    getAllSessionForSpecificParent
  );
router
  .route("/ForParentToOneDoctor/:doctorId")
  .get(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    getAllSessionForParentToOneDoctor
  );
router
  .route("/ForParentToOneDoctor/:doctorId/status/:status")
  .get(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    getAllSessionForParentToOneDoctorByStatus
  );

router
  .route("/ForParent/status/:status")
  .get(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    getAllSessionForSpecificParentByStatus
  );

router
  .route("/allSessionsForSpecificDoctors")
  .get(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    getAllSessionsForDoctor
  );

router
  .route("/allSessionsForDoctorsToOneParent/:parentId")
  .get(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    getAllSessionForSpecificDoctor
  );

router
  .route("/allSessionsForDoctor/status/:status")
  .get(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    getAllSessionsFotDoctorByStatus
  );

// Add comment
router
  .route("/:sessionId/comments")
  .post(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    addCommentToSpecificSession
  );

// Dynamic :id route LAST
router
  .route("/:id")
  .get(getSessionValidator, getSpecificSession)
  .put(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    updateSessionValidator,
    updateSpecificSession
  )
  .delete(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    deleteSessionValidator,
    deleteSpecificSession
  );

module.exports = router;
