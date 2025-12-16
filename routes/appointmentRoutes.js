const express = require("express");
const {
  createAppointment,
  getAvailableAppointments,
  bookAppointment,
  getPatientBookings,
  confirmAppointment,
  cancelAppointment,
  getDoctorAppointments,
  getDoctorsForParent,
  updateAppointment,
  getAllAppointment,
  deleteAppointment,
  getAllRegisterParentsForDoctor,
  getAllTimeForSpecificDotor,
  getAllTimeForSpecificDotorByStatus,
  getAllTimeAvailableForSpecificDayAndDate,
  deleteAllAppointmentForSpecificDoctor,
} = require("../services/appointmentServices");

const {
  createAppointmentValidator,
  bookAppointmentValidator,
  confirmAppointmentValidator,
  getAvailableAppointmentsValidator,
  updateAppointmentValidator,
  getDoctorAppointmentsValidator,
  cancelAppointmentValidator,
  deleteAppointmentValidator,
} = require("../utils/validator/appointmentValidator");

const AuthServices = require("../services/authServices");

const router = express();

router
  .route("/createAppointment")
  .post(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    createAppointmentValidator,
    createAppointment
  );
router
  .route("/getDoctorAppointments")
  .get(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    getDoctorAppointmentsValidator,
    getDoctorAppointments
  );
router
  .route("/updateAppointment")
  .put(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    updateAppointmentValidator,
    updateAppointment
  );
router
  .route("/deleteAppointment")
  .delete(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    deleteAppointmentValidator,
    deleteAppointment
  );

router
  .route("/bookAppointment/:doctorId")
  .post(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    bookAppointmentValidator,
    bookAppointment
  );

router
  .route("/")
  .get(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    getPatientBookings
  );

router
  .route("/my_doctor")
  .get(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    getDoctorsForParent
  );
router
  .route("/allRegisterParent")
  .get(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    getAllRegisterParentsForDoctor
  );

router
  .route("/getapp/:doctorId")
  .get(getAvailableAppointmentsValidator, getAvailableAppointments);

router.route("/getall").get(getAllAppointment);

router.route("/getTimes/:doctorId").get(getAllTimeForSpecificDotor);
router
  .route("/getTimesByStatus/:doctorId/status/:status")
  .get(getAllTimeForSpecificDotorByStatus);
router
  .route("/getAvailableTimesForDayAndDate/:doctorId")
  .post(getAllTimeAvailableForSpecificDayAndDate);

router
  .route("/confirm/:appointmentId")
  .get(
    AuthServices.protectForDoctor,
    AuthServices.allowedToForDoctor("doctor"),
    confirmAppointmentValidator,
    confirmAppointment
  );

router
  .route("/cancel/:appointmentId")
  .get(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    cancelAppointmentValidator,
    cancelAppointment
  );

router
  .route("/deleteAppointment/:doctorId")
  .delete(deleteAllAppointmentForSpecificDoctor);

module.exports = router;
