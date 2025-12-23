const mongoose = require("mongoose");

const medicanSchema = new mongoose.Schema(
  {
    medican_name: {
      type: String,
      required: [true, "Medican Name is required.."],
    },
    medican_info: {
      type: String,
      required: [true, "Medican Info is required.."],
    },
    medican_image: {
      type: String,
      required: [true, "Medican Image is required.."],
    },

    pharmacy: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Medican must belong to Pharamcy"],
      ref: "Pharmacy",
    },
    ratings: {
      type: Number,
    },
  },
  { timestamps: true }
);

medicanSchema.pre(/^find/, function (next) {
  this.populate({
    path: "pharmacy",
    select: "p_name p_location p_phone",
  });
  next();
});

module.exports = mongoose.model("Medican", medicanSchema);
