const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.ObjectId,
      required: [true, "appointment must belong to doctor"],
      ref: "Doctor",
    },

    parentId: {
      type: mongoose.Schema.ObjectId,
      ref: "Parent",
      //   required: [true, "appointment must belong to User"],
    },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    day: { type: String, required: true },

    time: { type: String, required: true }, // "HH:MM AM/PM"

    status: {
      type: String,
      enum: ["available", "booked", "cancelled", "confirmed"],
      default: "available",
    },
  },
  { timestamps: true }
);

// appointmentSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "doctorId",
//     select: "parent",
//   });
//   next();
// });
// appointmentSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "parentId",
//     select: "userName email role",
//   });
//   next();
// });

module.exports = mongoose.model("Appointment", appointmentSchema);
