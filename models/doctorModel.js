const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Doctor must belong to User ID"],
      ref: "Parent",
    },

    speciailization: {
      type: String,
      required: [true, "Doctor specialization is required"],
    },

    qualifications: {
      type: String,
      required: [true, "Doctor Qualifications Required.."],
    },

    //*medicalLicense we need to upload medicalLicense as pdf
    medicalLicense: {
      type: String,
      required: [true, "Doctor Medical License Required.."],
    },

    Session_price: {
      type: Number,
      required: [true, "Doctor Session Price Required.."],
    },

    //**
    availableDays: [{ type: String }], // e.g., ["Monday", "Wednesday", "Friday"]

    //* Review
    ratingsAverage: {
      type: Number,
      min: [1, "Min Rating Value is 1.0"],
      max: [5, "Max Rating Value is 5.0"],
    },

    ratingQuantity: {
      type: Number,
      default: 0,
    },
    image: String,
    role: {
      type: String,
      default: "doctor",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

doctorSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "doctor",
  localField: "_id",
});

doctorSchema.pre(/^find/, function (next) {
  this.populate({
    path: "parent",
    select: "userName email childs age address phone",
  });
  next();
});

// Indexes for query performance
doctorSchema.index({ parent: 1 });
doctorSchema.index({ speciailization: 1 });
doctorSchema.index({ ratingAverage: -1 });
doctorSchema.index({ Session_price: 1 });
doctorSchema.index({ role: 1 });

module.exports = mongoose.model("Doctor", doctorSchema);
