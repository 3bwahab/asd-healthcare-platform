const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const multer = require("multer");

const { cloudinaryConfig } = require("../utils/cloudinary");

const ApiError = require("../utils/apiError");
const Parent = require("../models/parentModel");
const createToken = require("../utils/createToken");
const factory = require("./handlersFactory");

//*1- DiskStorage engine
const multerStorage = multer.diskStorage({});

const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError(`Only Image Allowed`, 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadParentImage = upload.single("image");

exports.uploadToCaloud = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const data = await cloudinaryConfig().uploader.upload(req.file.path, {
      folder: "Cloud/Remote",
      resource_type: "image",
      use_filename: true,
    });

    req.body.image = data.secure_url;
  }
  next();
});
/**
 * Create Parent
 * @router Post /api/v1/Parents
 * @access private/Parent
 */

exports.createParent = factory.createOne(Parent);

/**
 * Get All Parent
 * @router Get /api/v1/Parents
 * @access private/Parent
 */
exports.getAllParents = factory.getAll(Parent);

/**
 * Get Spesific Parent
 * @router Get /api/v1/Parents/:id
 * @access private/Parent
 */

exports.getSpecificParent = factory.getOne(Parent, "childs");

/**
 * Update Parent Data
 * @router Put /api/v1/Parents/:id
 * @access private/Parent
 */
exports.updateParent = factory.updateOne(Parent);

/**
 * Delete Parent Data
 * @router Delete /api/v1/Parents/:id
 * @access private/Parent
 */
exports.deleteParent = factory.deleteOne(Parent);

exports.deleteAllParent = asyncHandler(async (req, res, next) => {
  await Parent.deleteMany();
  res.status(200).json({ message: "Parents deleted successfully" });
});

/**
 * Update User Password
 * @router Put /api/v1/users/changePassword/:id
 * @access private/user
 */
exports.changePassword = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const parent = await Parent.findByIdAndUpdate(
    id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );
  if (!parent) {
    return next(new ApiError(`There is no parent for this id ${id}`, 404));
  }
  res.status(200).json({ data: parent });
});

/**
 * Get Logged User
 * @router Get /api/v1/users/getMe
 * @access protect/user
 */

exports.getLoggedParentData = asyncHandler(async (req, res, next) => {
  const parent = await Parent.findById(req.parent._id);
  if (!parent) {
    return next(
      new ApiError(`There is no parent for this id:${req.parent.id}`)
    );
  }
  res.status(200).json({ data: parent });
});

/**
 * Update Logged Parent Password
 * @router Put /api/v1/Parents/updateMyPassword
 * @access protect/Parent
 */

exports.updateLoggedParentPassword = asyncHandler(async (req, res, next) => {
  const parent = await Parent.findByIdAndUpdate(
    req.parent._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );

  const token = createToken(parent._id);

  res.status(200).json({ data: parent, token });
});

/**
 * Update Logged Parent Password
 * @router Put /api/v1/Parents/updateMe
 * @access protect/Parent
 */

exports.updateLoggedParentData = asyncHandler(async (req, res, next) => {
  const parent = await Parent.findByIdAndUpdate(
    req.parent._id,
    {
      userName: req.body.userName,
      phone: req.body.phone,
      email: req.body.email,
      gender: req.body.gender,
      age: req.body.age,
      address: req.body.address,
      image: req.body.image,
    },
    { new: true }
  );
  if (!parent) {
    return next(new ApiError(`There is no parent for this id ${id}`, 404));
  }
  res.status(200).json({ data: parent });
});

/**
 * Delete Parent Data
 * @router Delete /api/v1/Parents/:id
 * @access private/Parent
 */
exports.deleteLoggedParentData = asyncHandler(async (req, res, next) => {
  const parent = await Parent.findByIdAndUpdate(req.parent._id, {
    active: false,
  });
  if (!parent) {
    return next(
      new ApiError(`There is no parent for this id ${req.parent._id}`, 404)
    );
  }
  res.status(200).json({ status: "Success" });
});

exports.activateLoggedParentData = asyncHandler(async (req, res, next) => {
  const parent = await Parent.findByIdAndUpdate(req.parent._id, {
    active: true,
  });
  if (!parent) {
    return next(
      new ApiError(`There is no parent for this id ${req.parent._id}`, 404)
    );
  }
  res.status(200).json({ status: "Success" });
});
