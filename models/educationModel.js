const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Article title is required"],
    trim: true,
  },
  info: {
    type: String,
    required: [true, "Article text is required"],
  },
  image: {
    type: String,
    required: [true, "Article image is required"],
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parent",
    required: [true, "Article creator is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Education", educationSchema);
