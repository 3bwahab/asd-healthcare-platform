const asyncHandler = require("express-async-handler");
const multer = require("multer");

const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");
const Education = require("../models/educationModel");
const Parent = require("../models/parentModel");
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

exports.uploadUserImage = upload.single("image");

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
 * @desc    Create a new Article
 * @route   POST /api/v1/articles
 * @access  Private (admin/doctor/etc.)
 */
exports.createArticle = asyncHandler(async (req, res, next) => {
  const parent = await Parent.findById(req.parent._id);
  if (!parent) {
    return next(
      new ApiError(
        `The Articles must belong to valid Parent id ${req.parent._id}`,
        404
      )
    );
  }
  const articles = await Education.create({
    title: req.body.title,
    info: req.body.info,
    creator: req.parent._id,
    image: req.body.image,
  });

  res.status(200).json({ data: articles });
});

/**
 * @desc    Get all Articles
 * @route   GET /api/v1/articles

 */
exports.getAllArticles = factory.getAll(Education);

/**
 * @desc    Get a single Article
 * @route   GET /api/v1/articles/:id

 */
exports.getSpecificArticle = factory.getOne(Education);

/**
 * @desc    Update an Article
 * @route   PUT /api/v1/articles/:id

 */
exports.updateSpecificArticle = factory.updateOne(Education);

/**
 * @desc    Delete an Article
 * @route   DELETE /api/v1/articles/:id

 */
exports.deleteSpecificArticle = factory.deleteOne(Education);
