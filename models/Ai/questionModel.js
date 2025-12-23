const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["screening"],
      required: [true, "Question type Required.."],
    },
    index: {
      type: Number,
      required: [true, "Question index Required.."],
      unique: true,
    },
    text: {
      type: String,
      required: true,
    },
    options: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
