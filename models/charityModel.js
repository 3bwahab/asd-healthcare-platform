const mongoose = require("mongoose");

const charitySchema = new mongoose.Schema(
  {
    charity_name: {
      type: String,
      required: [true, "Charity name is required"],
    },
    charity_address: {
      type: String,
      required: [true, "Charity address is required"],
    },
    charity_phone: {
      type: String,
      required: [true, "Charity phone is required"],
    },
    charity_medican: [
      {
        type: mongoose.Schema.ObjectId,
        required: [true, "Charity medicin is required"],
        ref: "Medican",
      },
    ],
    logo: {
      type: String,
    },
  },
  { timestamps: true }
);

charitySchema.pre(/^find/, function (next) {
  this.populate({
    path: "charity_medican",
    select: "medican_name medican_info medican_image",
    populate: {
      path: "pharmacy", // ده الـ virtual field اللي جوه parent
      select: "p_name p_location p_phone",
    },
  });
  next();
});

module.exports = mongoose.model("Charity", charitySchema);
