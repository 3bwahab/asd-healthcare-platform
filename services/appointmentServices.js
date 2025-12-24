const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");
const Parent = require("../models/parentModel");
// const sendEmail = require("../utils/sendEmail");

//** 1- Doctor Creates Available Time Slots
//* protected as doctor
exports.createAppointment = asyncHandler(async (req, res, next) => {
  const doctorId = req.doctor._id;
  const { availableSlots } = req.body; // [{ date, day, time }]

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(
      new ApiError(`There is no doctor for this id: ${doctorId}`, 404)
    );
  }

  // Create appointments for each slot
  const createdAppointments = [];

  // Check all slots for conflicts before creating any
  for (const slot of availableSlots) {
    const { date, day, time } = slot;

    const existing = await Appointment.findOne({
      doctorId,
      date,
      day,
      time,
    });

    if (existing) {
      return next(
        new ApiError(
          `This time slot already exists: ${date} - ${day} - ${time}`,
          400
        )
      );
    }
  }

  // All slots are available, create them atomically
  for (const slot of availableSlots) {
    const { date, day, time } = slot;

    const appointment = await Appointment.create({
      doctorId,
      date,
      day,
      time,
    });

    createdAppointments.push(appointment);
  }

  res.status(201).json({
    message: "Appointment slots created successfully",
    appointments: createdAppointments,
  });
});

//** 2- get Doctor Appointments
exports.getDoctorAppointments = asyncHandler(async (req, res, next) => {
  const { doctorId } = req.body;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(
      new ApiError(`There is no doctor for this id :${doctorId}`, 404)
    );
  }

  const appointment = await Appointment.find({
    doctorId,
    status: "booked",
  });

  res.status(200).json({ message: "Doctor's Appointments", appointment });
});

//** 3- update Appointment For Doctor
exports.updateAppointment = asyncHandler(async (req, res, next) => {
  const { appointmentId, date, day, time } = req.body;

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return next(
      new ApiError(`No appointment found for ID: ${appointmentId}`, 404)
    );
  }

  const doctor = await Doctor.findById(appointment.doctorId);

  if (!doctor) {
    return next(
      new ApiError(
        `The Doctor Belong To This Appointment No longer Exist Id: ${appointment.doctorId}`,
        404
      )
    );
  }

  if (appointment.doctorId.toString() !== req.doctor._id.toString()) {
    return next(new ApiError("Unauthorized doctor", 403));
  }

  appointment.date = date || appointment.date;
  appointment.time = time || appointment.time;
  appointment.day = day || appointment.day;
  await appointment.save();

  res.status(200).json({ message: "Appointment updated", appointment });
});

//** 4- delete Appointment For Doctor
exports.deleteAppointment = asyncHandler(async (req, res, next) => {
  const { appointmentId } = req.body;

  // SECURITY FIX: Find appointment first before deletion
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(
      new ApiError(`No appointment found for ID: ${appointmentId}`, 404)
    );
  }

  // SECURITY FIX: Check authorization BEFORE deleting
  if (appointment.doctorId.toString() !== req.doctor._id.toString()) {
    return next(new ApiError("Unauthorized doctor", 403));
  }

  const doctor = await Doctor.findById(appointment.doctorId);

  if (!doctor) {
    return next(
      new ApiError(
        `The doctor for this appointment no longer exists (ID: ${appointment.doctorId})`,
        404
      )
    );
  }

  // Now safe to delete after authorization check passed
  await Appointment.findByIdAndDelete(appointmentId);

  res.status(200).json({ message: "Appointment deleted successfully" });
});

//** 5- Get Available Appointments
exports.getAvailableAppointments = asyncHandler(async (req, res, next) => {
  const { doctorId } = req.params;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(
      new ApiError(`There is no doctor for this id ${doctorId}`, 404)
    );
  }

  let availableAppointments = await Appointment.find({
    doctorId,
    status: { $in: ["available", "cancelled"] },
  }).select("date time day");

  if (!availableAppointments) {
    return next(
      new ApiError(`No available appointments found for this doctor.`, 404)
    );
  }

  res.status(200).json({
    message: "Available Appointments",
    data: availableAppointments,
  });
});

//** 6- User Books an Appointment
//* protected as parent
exports.bookAppointment = asyncHandler(async (req, res, next) => {
  const { doctorId } = req.params;
  const { date, day, time } = req.body;
  const parentId = req.parent._id;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(
      new ApiError(`There is no doctor for this id: ${doctorId}`, 404)
    );
  }

  const appointment = await Appointment.findOneAndUpdate(
    {
      doctorId,
      date,
      day,
      time,
      status: "available",
    },
    {
      status: "booked",
      parentId,
    },
    {
      new: true,
    }
  );

  if (!appointment) {
    return next(new ApiError(`Selected time slot is not available`, 404));
  }

  res.status(201).json({
    message: "Appointment booked successfully",
    data: appointment,
  });
});

//* 7- Get Patient's Booked Appointments
//* protected as parent
exports.getPatientBookings = asyncHandler(async (req, res, next) => {
  const parentId = req.parent._id;

  const appointment = await Appointment.find({ parentId });
  if (!appointment) {
    return next(
      new ApiError(`There is no any appointment to this user ${parentId}`, 404)
    );
  }

  res.status(200).json({ appointment });
});

//* 8- Get All Oppointement for Admin
exports.getAllAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.find();
  res.status(200).json({ appointment });
});

//** 9- Cancel Appointment
// * protected as parent
exports.cancelAppointment = asyncHandler(async (req, res, next) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(
      new ApiError(`There is no appointment for this id: ${appointmentId}`, 404)
    );
  }

  if (appointment.parentId?.toString() !== req.parent._id.toString()) {
    return next(
      new ApiError(`You are not authorized to cancel this appointment.`, 403)
    );
  }

  appointment.status = "available";
  appointment.parentId = undefined;
  await appointment.save();

  res.status(200).json({
    message: "Appointment cancelled successfully",
    appointment,
  });
});

//** 10- Confirm Appointment
//* protected as doctor
exports.confirmAppointment = asyncHandler(async (req, res, next) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(
      new ApiError(`There is no appointment for this id: ${appointmentId}`, 404)
    );
  }

  if (appointment.doctorId?.toString() !== req.doctor._id.toString()) {
    return next(
      new ApiError(`You are not authorized to confirm this appointment.`, 403)
    );
  }

  if (!appointment.parentId) {
    return next(
      new ApiError(`No parent has booked this appointment yet.`, 400)
    );
  }

  appointment.status = "confirmed";
  await appointment.save();

  res.status(200).json({
    message: "Appointment confirmed successfully",
    appointment,
  });
});

//----------------------
//** 11- Get All Doctors Booked by a Specific Parent
//* protected as parent
exports.getDoctorsForParent = asyncHandler(async (req, res, next) => {
  const parentId = req.parent._id;

  const doctorIds = await Appointment.find({
    parentId,
    status: "booked",
  }).distinct("doctorId");

  if (!doctorIds || doctorIds.length === 0) {
    return next(new ApiError(`No doctors found for this parent`, 404));
  }

  const doctors = await Doctor.find({ _id: { $in: doctorIds } }).select(
    "parent"
  );

  res.status(200).json({
    message: "Doctors connected to this parent",
    doctors,
  });
});

//** 11- Get All Doctors Booked by a Specific Parent
//* protected as parent
exports.getAllRegisterParentsForDoctor = asyncHandler(
  async (req, res, next) => {
    const doctorId = req.doctor._id;

    const parentIds = await Appointment.find({
      doctorId,
      status: "booked",
    }).distinct("parentId");

    if (!parentIds || parentIds.length === 0) {
      return next(
        new ApiError(`No parent registered found for this doctors`, 404)
      );
    }

    const parents = await Parent.find({ _id: { $in: parentIds } }).select(
      "userName email"
    );

    res.status(200).json({
      message: "parents connected to this doctor",
      parents,
    });
  }
);

// * 12 - Get all available times for a specific Doctor
exports.getAllTimeForSpecificDotor = asyncHandler(async (req, res, next) => {
  const { doctorId } = req.params;
  const appointments = await Appointment.find({
    doctorId,
  });

  if (!appointments.length) {
    return next(
      new ApiError(`There are no available times for Specific doctor`, 404)
    );
  }

  const availableTimes = appointments.map((app) => app.time);

  res.status(200).json({
    status: "All times",
    result: availableTimes.length,
    data: availableTimes,
  });
});

// * 12 - Get all available times for a specific Doctor
exports.getAllTimeForSpecificDotorByStatus = asyncHandler(
  async (req, res, next) => {
    const { doctorId, status } = req.params;
    const appointments = await Appointment.find({
      doctorId,
      status,
    });

    if (!appointments.length) {
      return next(
        new ApiError(`There are no available times for Specific doctor`, 404)
      );
    }

    const availableTimes = appointments.map((app) => app.time);

    res.status(200).json({
      status: "Available times",
      result: availableTimes.length,
      data: availableTimes,
    });
  }
);

// * 12 - Get all available times for a specific day and date
exports.getAllTimeAvailableForSpecificDayAndDate = asyncHandler(
  async (req, res, next) => {
    const { doctorId } = req.params;
    const { date, day } = req.body;

    const appointments = await Appointment.find({
      doctorId,
      date,
      day,
      status: "available",
    });

    if (!appointments.length) {
      return next(
        new ApiError(
          `There are no available times for date: ${date}, day: ${day}`,
          404
        )
      );
    }

    const availableTimes = appointments.map((app) => app.time);

    res.status(200).json({
      status: "Available times For Doctor",
      result: availableTimes.length,
      data: availableTimes,
    });
  }
);

exports.deleteAllAppointmentForSpecificDoctor = asyncHandler(
  async (req, res, next) => {
    //
    const { doctorId } = req.params;
    await Appointment.deleteMany({
      doctorId,
      status: "available",
    });
    res.status(200).json({
      status: "Success",
      message: "All Available Appointment Deleted Succssfully !",
    });
  }
);
