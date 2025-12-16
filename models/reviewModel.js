const mongoose = require("mongoose");

const Doctor = require("./doctorModel");

const reviewSchema = new mongoose.Schema(
  {
    ratings: {
      type: Number,
      min: [1, "Min Rating Value is 1.0"],
      max: [5, "Max Rating Value is 5.0"],
      required: [true, "Review Rating Required.."],
    },

    title: {
      type: String,
    },

    parent: {
      type: mongoose.Schema.ObjectId,
      ref: "Parent",
      required: [true, "Review Must Belong to parent.."],
    },

    doctor: {
      type: mongoose.Schema.ObjectId,
      ref: "Doctor",
      required: [true, "Review Must Belong to doctor.."],
    },

    date: {
      type: Date,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "parent",
    select: "userName email role image",
  });
  next();
});

reviewSchema.virtual("dateOnly").get(function () {
  if (!this.date) return null;
  return this.date.toISOString().split("T")[0];
});

reviewSchema.statics.calcAverageRatingsAndQuantity = async function (doctorId) {
  const result = await this.aggregate([
    //Stage 1-get all reviews in specific product
    {
      $match: { doctor: doctorId },
    },
    //Stage 2-groping reviews based on doctorId and calc(avgRatings, ratingsQuantity)
    {
      $group: {
        _id: "doctor",
        avgRatings: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
  if (result.length > 0) {
    await Doctor.findByIdAndUpdate(
      doctorId,
      {
        ratingsAverage: result[0].avgRatings,
        ratingQuantity: result[0].ratingsQuantity,
      },
      { new: true }
    );
  } else {
    await Doctor.findByIdAndUpdate(
      doctorId,
      {
        ratingsAverage: 0,
        ratingQuantity: 0,
      },
      { new: true }
    );
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.doctor);
});

reviewSchema.post("findOneAndDelete", async function ({ doctor }) {
  await this.model.calcAverageRatingsAndQuantity(doctor);
});

module.exports = mongoose.model("Review", reviewSchema);
