const { check } = require("express-validator");

const validatorMiddlware = require("../../middlware/validatorMiddlware");
exports.createAppointmentValidator = [
  check("availableSlots")
    .notEmpty()
    .withMessage("Avaliable Slot For Doctor Appointment Is Required"),
  validatorMiddlware,
];

exports.getDoctorAppointmentsValidator = [
  check("doctorId")
    .notEmpty()
    .withMessage("Doctor Id is Required..")
    .isMongoId()
    .withMessage("Invalid Id Format.."),
  validatorMiddlware,
];

exports.updateAppointmentValidator = [
  check("appointmentId").isMongoId().withMessage("Invalid Id Format.."),

  validatorMiddlware,
];
exports.deleteAppointmentValidator = [
  check("appointmentId").isMongoId().withMessage("Invalid Id Format.."),
  validatorMiddlware,
];

exports.getAvailableAppointmentsValidator = [
  check("doctorId")
    .notEmpty()
    .withMessage("Doctor Id is Required..")
    .isMongoId()
    .withMessage("Invalid Id Format.."),
  validatorMiddlware,
];

exports.bookAppointmentValidator = [
  check("doctorId").isMongoId().withMessage("Invalid Id Format.."),
  check("date").notEmpty().withMessage("Appointment Date is Required.."),
  check("day").notEmpty().withMessage("Appointment Day is Required.."),
  check("time").notEmpty().withMessage("Appointment Time is Required.."),
  validatorMiddlware,
];

exports.cancelAppointmentValidator = [
  check("appointmentId").isMongoId().withMessage("Invalid Id Format.."),
  validatorMiddlware,
];

exports.confirmAppointmentValidator = [
  check("appointmentId")
    .notEmpty()
    .withMessage("Doctor Appointment Id is Required..")
    .isMongoId()
    .withMessage("Invalid Id Format.."),
  validatorMiddlware,
];
