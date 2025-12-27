const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const Child = require("../models/childModel");
const Parent = require("../models/parentModel");
const factory = require("./handlersFactory");

// //* Nested route
exports.setParentIdToBody = (req, res, next) => {
  if (!req.body.parent) req.body.parent = req.parent._id;
  next();
};
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.parentId) filterObject = { parent: req.params.parentId };
  req.filterObj = filterObject;
  next();
};
//*----------------------
/**
 * Create Child
 * @router Post /api/v1/Childs
 * @access private/Child
 */

// --updated
exports.createChild = asyncHandler(async (req, res, next) => {
  const parent = await Parent.findById(req.parent._id);
  if (!parent) {
    // BUG FIX: Fixed typos and undefined variable 'val'
    return next(
      new ApiError(`There is no parent for this id: ${req.parent._id}`, 404)
    );
  }

  const child = await Child.create({
    parent: req.parent._id,
    childName: req.body.childName,
    birthday: req.body.birthday,
    gender: req.body.gender,
    age: req.body.age,
    healthDetails: req.body.healthDetails,
  });

  res.status(201).json({ data: child });
});

/**
 * Get All Child
 * @router Post /api/v1/Childs
 * @access private/Child
 */

exports.getAllChilds = factory.getAll(Child);
/**
 * Get Specific Child
 * @router Post /api/v1/Childs/:id
 * @access private/Child
 */

exports.getSpecificChild = factory.getOne(Child);
/**
 * Update Specific Child
 * @router Put /api/v1/Childs/:id
 * @access private/Child
 */

exports.updateSpecificChild = factory.updateOne(Child);

/**
 * Delete Specific Child
 * @router delete /api/v1/Childs/:id
 * @access private/Child
 */

exports.deleteSpecificChild = factory.deleteOne(Child);

/**
 * Delete All Child
 * @router delete /api/v1/Childs
 * @access private/Child
 */

exports.deleteAllChild = asyncHandler(async (req, res, next) => {
  // SECURITY FIX: Only delete children belonging to authenticated parent
  const result = await Child.deleteMany({ parent: req.parent._id });
  res.status(200).json({
    message: "Children deleted successfully",
    deletedCount: result.deletedCount,
  });
});
