const asyncHandler = require("express-async-handler");
const multer = require("multer");
const Charity = require("../models/charityModel");
const factory = require("./handlersFactory");

const { cloudinaryConfig } = require("../utils/cloudinary");
const ApiError = require("../utils/apiError");

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

exports.uploadCharityLogo = upload.single("logo");

exports.uploadToCaloud = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const data = await cloudinaryConfig().uploader.upload(req.file.path, {
      folder: "Charity/Logos",
      resource_type: "image",
      use_filename: true,
    });

    req.body.logo = data.secure_url;
  }
  next();
});

/**
 * Create Charity
 * @router Post /api/v1/charities
 * @access private
 */
exports.createCharity = factory.createOne(Charity);

/**
 * Get All Charities
 * @router Get /api/v1/charities
 * @access private
 */
exports.getAllCharities = factory.getAll(Charity);

/**
 * Get Specific Charity
 * @router Get /api/v1/charities/:id
 * @access private
 */
exports.getSpecificCharity = factory.getOne(Charity);

/**
 * Update Specific Charity
 * @router Put /api/v1/charities/:id
 * @access private
 */
exports.updateSpecificCharity = factory.updateOne(Charity);

/**
 * Delete Specific Charity
 * @router Delete /api/v1/charities/:id
 * @access private
 */
exports.deleteSpecificCharity = factory.deleteOne(Charity);

exports.getAllMedicianForSpecificCharity = asyncHandler(
  async (req, res, next) => {
    const { charityId } = req.params;
    const charity = await Charity.findById(charityId);
    if (!charity) {
      return next(
        new ApiError(` There is no Charity For This Id ${charityId}`, 400)
      );
    }

    res.status(200).json({ status: "Succsess", data: charity.charity_medican });
  }
);
