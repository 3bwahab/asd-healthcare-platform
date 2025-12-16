const asyncHandler = require("express-async-handler");

const Session = require("../models/SessionModel");
const Parent = require("../models/parentModel");
const ApiError = require("../utils/apiError");

exports.addReviewToSession = asyncHandler(async (req, res, next) => {
  const parent = await Parent.findById(req.parent._id);

  if (!parent) {
    return next(
      new ApiError(`there is no parent for this id:${req.parent._id}`, 404)
    );
  }

  const { sessionId } = req.params;

  const session = await Session.findByIdAndUpdate(
    sessionId,
    {
      $addToSet: {
        session_review: {
          parentId: req.parent._id,
          ratings: req.body.ratings,
          title: req.body.title,
        },
      },
    },
    { new: true }
  );

  if (!session) {
    return next(
      new ApiError(`there is no session for this id:${sessionId}`, 404)
    );
  }

  res.status(200).json({
    status: "Success",
    message: "Session Review Added Successfully",
    data: session.session_review,
  });
});

exports.removeReviewFromSession = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;

  const session = await Session.findByIdAndUpdate(
    sessionId,
    {
      $pull: { session_review: { _id: req.body.reviewId } },
    },
    { new: true }
  );

  if (!session) {
    return next(
      new ApiError(`there is no session for this id:${sessionId}`, 404)
    );
  }

  res.status(200).json({
    status: "Success",
    message: "Session Review Deleted Successfully",
    data: session.session_review,
  });
});

exports.getAllReviewOnSpecificSession = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;

  const session = await Session.findById(sessionId).populate({
    path: "session_review.parentId",
    select: "userName email childs",
    strictPopulate: false,
    populate: {
      path: "childs",
      select: "childName gender -parent",
    },
  });

  if (!session) {
    return next(
      new ApiError(`There is no session for this ID: ${sessionId}`, 404)
    );
  }

  res.status(200).json({
    status: "Success",
    SessionId: session._id,
    results: session.session_review.length,
    data: session.session_review,
  });
});
