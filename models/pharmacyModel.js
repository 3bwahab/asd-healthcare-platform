const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema(
  {
    p_owner: {
      type: String,
      required: [true, "Pharmacy Owner is required.."],
    },
    p_name: {
      type: String,
      required: [true, "Pharmacy Name is required.."],
    },
    p_location: {
      type: String,
      required: [true, "Pharmacy Location is required.."],
    },
    p_phone: {
      type: String,
      required: [true, "Pharmacy Phone is required.."],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pharmacy", pharmacySchema);
