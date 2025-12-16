const mongoose = require("mongoose");

const Parent = require("../models/parentModel");

const childSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Child must belong to a parent."],
      ref: "Parent",
    },

    childName: {
      type: String,
      required: [true, "Child Name is required."],
      maxlength: [20, "Too long Child Name."],
    },

    birthday: {
      type: String,
      required: [true, "Child Birthday is required."],
    },

    age: {
      type: String,
      required: [true, "Child Age is required."],
    },

    gender: {
      type: String,
      required: [true, "Child Gender is required."],
      enum: ["male", "female"],
    },

    healthDetails: {
      type: String,
    },

    autism_level: String,
    degree_level: String,

    image: String,
  },
  { timestamps: true }
);

// childSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "parent",
//     select: "address",
//   });
//   next();
// });

childSchema.statics.calcNumOfChild = async function (parentId) {
  const result = await this.aggregate([
    //Stage 1-get all reviews in specific product
    {
      $match: { parent: parentId },
    },
    //Stage 2-groping reviews based on doctorId and calc(avgRatings, ratingsQuantity)
    {
      $group: {
        _id: "parent",
        numberOfCild: { $sum: 1 },
      },
    },
  ]);
  if (result.length > 0) {
    await Parent.findByIdAndUpdate(
      parentId,
      {
        numOfChild: result[0].numberOfCild,
      },
      { new: true }
    );
  } else {
    await Parent.findByIdAndUpdate(
      parentId,
      {
        numOfChild: 0,
      },
      { new: true }
    );
  }
};

childSchema.post("save", async function () {
  await this.constructor.calcNumOfChild(this.parent);
});

childSchema.post("findOneAndDelete", async function ({ parent }) {
  await this.model.calcNumOfChild(parent);
});

module.exports = mongoose.model("Child", childSchema);
