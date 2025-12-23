const asyncHandler = require("express-async-handler");

const Medican = require("../models/medicanModel");
const factory = require("./handlersFactory");

const multer = require("multer");

const { cloudinaryConfig } = require("../utils/cloudinary");

//*1- DiskStorage engine
const multerStorageForImage = multer.diskStorage({});

const multerFilterForImage = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError(`Only Image Allowed`, 400), false);
  }
};

const upload = multer({
  storage: multerStorageForImage,
  fileFilter: multerFilterForImage,
});

exports.uploadMedicanImage = upload.single("medican_image");

exports.uploadToCaloud = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const data = await cloudinaryConfig().uploader.upload(req.file.path, {
      folder: "Cloud/Remote",
      resource_type: "image",
      use_filename: true,
    });

    req.body.medican_image = data.secure_url;
  }
  next();
});

/**
 * Create Medican
 * @router Post /api/v1/medican
 * @access private/Medican
 */

exports.createMedican = factory.createOne(Medican);

/**
 * Get All Medican
 * @router Post /api/v1/medican
 * @access private/Medican
 */

exports.getAllMedicans = factory.getAll(Medican);
/**
 * Get Specific Medican
 * @router Post /api/v1/medican/:id
 * @access private/Medican
 */

exports.getSpecificMedican = factory.getOne(Medican);
/**
 * Update Specific Medican
 * @router Put /api/v1/medican/:id
 * @access private/Medican
 */

exports.updateSpecificMedican = factory.updateOne(Medican);

/**
 * Delete Specific Medican
 * @router delete /api/v1/medican/:id
 * @access private/Medican
 */

exports.deleteSpecificMedican = factory.deleteOne(Medican);
