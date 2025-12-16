const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    parent: {
      type: String,
      required: [true, "the order must belong to Parent"],
      ref: "Parent",
    },
    doctor: {
      type: String,
      required: [true, "the order must belong to Doctor"],
      ref: "Doctor",
    },
    info: {
      day: String,
      date: String,
      time: String,
    },

    price: {
      type: Number,
      required: [true, "Session Price is required."],
    },
    paymentMethodType: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// //nested populate
// orderSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "doctor",
//     select: "speciailization",
//     populate: {
//       path: "parent", // ده الـ virtual field اللي جوه parent
//       select: "userName email",
//     },
//   });
//   next();
// });

// orderSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "parent",
//     select: "userName email",
//   });
//   next();
// });

module.exports = mongoose.model("Order", orderSchema);
