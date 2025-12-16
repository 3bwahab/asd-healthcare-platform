const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const chatSessionSchema = new mongoose.Schema(
  {
    session_id: {
      type: String,
      required: true,
      unique: true,
    },
    chat_history: [messageSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);
