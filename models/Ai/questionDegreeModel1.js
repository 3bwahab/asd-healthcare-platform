const mongoose = require("mongoose");

const questionDegreeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["degree"],
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

module.exports = mongoose.model("QuestionDegree", questionDegreeSchema);
