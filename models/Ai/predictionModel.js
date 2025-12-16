const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Types.ObjectId,
      ref: "Parent",
      required: true,
    },
    type: {
      type: String,
      enum: ["autism", "degree"],
      required: true,
    },
    inputs: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prediction", predictionSchema);
