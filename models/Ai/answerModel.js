const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.ObjectId,
      ref: "Parent",
      required: true,
    },
    questionIndex: {
      type: Number,
      required: true,
    },
    answerText: {
      type: String,
      required: true,
    },
    relevance: {
      type: Boolean,
      required: true,
    },
    mappedResponse: {
      type: String,
    },
    type: {
      type: String,
      enum: ["screening", "degree"],
      required: true,
    },
  },
  { timestamps: true }
);
answerSchema.index({ parentId: 1, questionIndex: 1 }, { unique: true });

module.exports = mongoose.model("Answer", answerSchema);
