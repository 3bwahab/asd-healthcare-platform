const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");

const { cloudinaryConfig } = require("../utils/cloudinary");

const ApiError = require("../utils/apiError");
const Doctor = require("../models/doctorModel");
const Parent = require("../models/parentModel");
const createToken = require("../utils/createToken");
const factory = require("./handlersFactory");

//* For Image
//* 1- DiskStorage engine
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
exports.uploadDoctorImage = upload.single("image");
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

//* For Pdf
const multerStorageForPdf = multer.diskStorage({});
const multerFilterForPdf = function (req, file, cb) {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new ApiError(`Only PDF files are allowed`, 400), false);
  }
};
const uploadPdf = multer({
  storage: multerStorageForPdf,
  fileFilter: multerFilterForPdf,
});
exports.uploadDoctorMedicalLicense = uploadPdf.single("medicalLicense");

exports.pdfName = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const originalName = path.parse(req.file.originalname).name;
    const fileName = `${originalName}-${Date.now()}.pdf`;

    const data = await cloudinaryConfig().uploader.upload(req.file.path, {
      folder: "Cloud/Remote",
      resource_type: "raw",
      use_filename: true,
      filename_override: fileName,
      overwrite: true,
    });

    req.body.medicalLicense = data.secure_url;
  }
  next();
});

/**
 * Create Doctor
 * @router Post /api/v1/doctors
 * @access private/doctor
 */

exports.createDoctor = factory.createOne(Doctor);

/**
 * Get All Doctor
 * @router Get /api/v1/doctors
 * @access private/doctor
 */

exports.getAllDoctors = factory.getAll(Doctor);

/**
 * Get Spesific Doctor
 * @router Get /api/v1/doctors/:id
 * @access private/doctor
 */
exports.getSpecificDoctor = factory.getOne(Doctor, "reviews");

/**
 * Update Doctor Data
 * @router Put /api/v1/doctors/:id
 * @access private/doctor
 */
exports.updateSpecificDoctor = factory.updateOne(Doctor);
/**
 * Delete Doctor Data
 * @router Delete /api/v1/doctors/:id
 * @access private/doctor
 */

exports.deleteSpecificDoctor = factory.deleteOne(Doctor);

exports.deleteAllDoctor = asyncHandler(async (req, res, next) => {
  await Doctor.deleteMany();
  res.status(200).json({ message: "Doctors deleted successfully" });
});

/**
 * Get Logged Doctor
 * @router Get /api/v1/doctors/getMe
 * @access protect/doctor
 */
exports.getLoggedDoctorData = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.doctor._id).populate({
    path: "parent",
    select: "userName email password active",
  });
  if (!doctor) {
    return next(new ApiError(`There is no user for this id:${req.doctor.id}`));
  }

  res.status(200).json({ data: doctor });
});

/**
 * Update Logged Doctor Password
 * @router Put /api/v1/doctors/updateMyPassword
 * @access protect/doctor
 */
exports.updateLoggedDoctorPassword = asyncHandler(async (req, res, next) => {
  // 1-get user based on req.parent.user
  // 2-change the password

  const parent = await Parent.findByIdAndUpdate(
    req.doctor.parent,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAtForDoctor: Date.now(),
    },
    { new: true }
  );

  // 3-generate token and send the response
  const token = createToken(req.doctor._id);
  res.status(200).json({ data: req.doctor, token });
});

/**
 * Update Logged Parent Password
 * @router Put /api/v1/parents/updateMe
 * @access protect/user
 */

exports.updateLoggedDoctorData = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.doctor._id);
  if (!doctor) {
    return next(new ApiError("Doctor not found..", 404));
  }

  doctor.speciailization = req.body.speciailization ?? doctor.speciailization;
  doctor.qualifications = req.body.qualifications ?? doctor.qualifications;
  doctor.medicalLicense = req.body.medicalLicense ?? doctor.medicalLicense;
  doctor.image = req.body.image ?? doctor.image;

  await doctor.save();

  const parent = await Parent.findById(doctor.parent._id);
  if (!parent) {
    return next(new ApiError("Parent not found..", 404));
  }
  parent.userName = req.body.userName ?? parent.userName;
  parent.email = req.body.email ?? parent.email;
  parent.phone = req.body.phone ?? parent.phone;
  parent.age = req.body.age ?? parent.age;
  parent.address = req.body.address ?? parent.address;

  await parent.save();

  const updatedDoctor = await Doctor.findById(req.doctor._id);

  res.status(200).json({ data: updatedDoctor });
});

/**
 * Delete Doctor Data
 * @router Delete /api/v1/doctors/deleteMe
 * @access private/doctor
 */
exports.deleteLoggedDoctorData = asyncHandler(async (req, res, next) => {
  const parent = await Parent.findByIdAndUpdate(req.doctor.parent, {
    active: false,
  });
  if (!parent) {
    return next(
      new ApiError(`There is no user for this id ${req.doctor.user}`, 404)
    );
  }
  res.status(200).json({ status: "deActivate Success" });
});

/**
 * Active Doctor Data
 * @router Delete /api/v1/doctors/activeMe
 * @access private/Doctor
 */
exports.activateLoggedDoctorData = asyncHandler(async (req, res, next) => {
  const parent = await Parent.findByIdAndUpdate(req.doctor.parent, {
    active: true,
  });
  if (!parent) {
    return next(
      new ApiError(`There is no user for this id ${req.doctor.user}`, 404)
    );
  }
  res.status(200).json({ status: "Activate Success" });
});
