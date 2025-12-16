const crypto = require("crypto");

const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { cloudinaryConfig } = require("../utils/cloudinary");

const Parent = require("../models/parentModel");
const Doctor = require("../models/doctorModel");

const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");

const createToken = require("../utils/createToken");

//******* Authentication For User */

/**
 * Singup For User
 * @router Post /api/v1/auth/singupForUser
 * @access public/parent
 */
// exports.singupForParent = asyncHandler(async (req, res, next) => {
//   try {
//     const parent = await Parent.create({
//       userName: req.body.userName,
//       email: req.body.email,
//       phone: req.body.phone,
//       password: req.body.password,
//       age: req.body.age,
//       address: req.body.address,
//     });

//     const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
//     const hashResetCode = crypto
//       .createHash("sha256")
//       .update(resetCode)
//       .digest("hex");

//     parent.emailResetCode = hashResetCode;
//     parent.emailResetExpire = Date.now() + 10 * 60 * 1000;
//     parent.emailResetVerfied = false;
//     await parent.save();

//     let message = `Hi ${parent.userName},\n We received a request to reset the Email on your ASD Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The ASD Team`;

//     await sendEmail({
//       email: req.body.email,
//       subject: "Your Email reset code(valide for 10 mints)",
//       message,
//     });

//     const token = createToken(parent._id);

//     res.status(200).json({
//       message: "Your Email reset code(valide for 10 mints)",
//       token,
//     });
//   } catch (error) {
//     console.error("Signup Error: ", error); // دي تطبعلك في الترمينال
//     next(new ApiError("Signup failed", 500));
//   }
// });

exports.singupForParent = asyncHandler(async (req, res, next) => {
  //*1- create User
  const parent = await Parent.create({
    userName: req.body.userName,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    age: req.body.age,
    address: req.body.address,
  });

  //* Generate reset random 6 digit and save it in
  const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  //* save hashed Email rest code into db
  parent.emailResetCode = hashResetCode;
  //* add expiration time for Email reset code (10 mints)
  parent.emailResetExpire = Date.now() + 10 * 60 * 1000;

  parent.emailResetVerfied = false;
  parent.save();

  //*1-Send reset Code To email in body
  let message = `Hi ${parent.userName},\n We received a request to reset the Email on your ASD Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The ASD Team`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: "Your Email reset code(valide for 10 mints)",
      message,
    });
  } catch (error) {
    parent.emailResetCode = undefined;
    parent.emailResetExpire = undefined;
    parent.emailResetVerfied = undefined;
    await parent.save();
    return next(new ApiError(`There is an error in sending email`, 500));
  }

  //*2-Generate Token
  const token = createToken(parent._id);

  res.status(200).json({
    parent,
    token,
  });
});

exports.resendEmailResetCode = asyncHandler(async (req, res, next) => {
  const email = req.parent.email;

  const parent = await Parent.findOne({ email });
  if (!parent) {
    return next(new ApiError("This email is not registered", 404));
  }

  const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  parent.emailResetCode = hashResetCode;
  parent.emailResetExpire = Date.now() + 10 * 60 * 1000; // 10 دقايق
  parent.emailResetVerfied = false;
  await parent.save();

  const message = `Hi ${parent.userName},\nHere is your email verification code: ${resetCode}\nThis code is valid for 10 minutes.\nThe ASD Team`;

  try {
    await sendEmail({
      email,
      subject: "Resend Email Verification Code",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Verification code resent to your email",
    });
  } catch (error) {
    return next(new ApiError("Failed to send the email", 500));
  }
});

/**
 * Verify Email Reset Code
 * @router Post /api/v1/auth/verifyemail
 * @access public/parent
 */

exports.verifyEmailResetCode = asyncHandler(async (req, res, next) => {
  //*1-Get user based on reset code
  const hashResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const parent = await Parent.findOne({
    emailResetCode: hashResetCode,
  });

  if (!parent) {
    return next(new ApiError(`Reset code invalid or expired`, 404));
  }
  parent.emailResetVerfied = true;
  await parent.save();

  res.status(200).json({ message: "Verify Success.." });
});

//*
exports.protectForParent = asyncHandler(async (req, res, next) => {
  //1-check if token exist , if exist get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError("you are not login, please login to access this route", 401)
    );
  }
  //2-verify token (no change happens ,expired token )
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  //3-check if user exsits
  const currentParent = await Parent.findById(decoded.userId);
  if (!currentParent) {
    return next(
      new ApiError(
        `The Parent that belong to this token does no longer exist`,
        404
      )
    );
  }

  if (currentParent.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentParent.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          `User recently changed his password, please login again..`,
          401
        )
      );
    }
  }

  req.parent = currentParent;

  next();
});

//******* Authentication For Doctor */

//*2- memoryStorage engine
//* For Pdf
const multerStorageForPdf = multer.diskStorage({});
const multerFilterForPdf = function (req, file, cb) {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/octet-stream"
  ) {
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
    const data = await cloudinaryConfig().uploader.upload(req.file.path, {
      folder: "Cloud/Remote",
      resource_type: "raw",
      use_filename: true,
    });

    req.body.medicalLicense = data.secure_url;
  }
  next();
});

/**
 * Singup For Doctor
 * @router Post /api/v1/auth/singupForDoctor
 * @access public/Doctor
 */
exports.singupForDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.create({
    parent: req.parent._id,
    speciailization: req.body.speciailization,
    qualifications: req.body.qualifications,
    medicalLicense: req.body.medicalLicense,
    address: req.body.address,
    Session_price: req.body.Session_price,
  });
  console.log(req.parent);

  const currentUser = await Parent.findById(req.parent._id);
  currentUser.role = "doctor";
  await currentUser.save();

  const token = createToken(doctor._id);

  res.status(201).json({ data: doctor, token });
});

/**
 * Login
 * @router Post /api/v1/auth/login
 * @access public/Doctor/parent
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const parent = await Parent.findOne({ email });

  if (!parent || !(await bcrypt.compare(password, parent.password))) {
    return next(new ApiError("Incorrect Email or Password", 401));
  }

  if (!parent.emailResetVerfied) {
    return next(new ApiError("You have not verified your account yet.", 403));
  }

  const doctor = await Doctor.findOne({ parent: parent._id });

  if (doctor) {
    const token = createToken(doctor._id);
    return res.status(200).json({
      data: doctor,
      token,
    });
  }

  const token = createToken(parent._id);
  return res.status(200).json({
    data: parent,
    token,
  });
});

exports.protectForDoctor = asyncHandler(async (req, res, next) => {
  //1-check if token exist , if exist get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError("you are not login, please login to access this route", 401)
    );
  }

  //2-verify token (no change happens ,expired token )
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  //3-check if user exsits
  const currentDoctor = await Doctor.findById(decoded.userId);
  if (!currentDoctor) {
    return next(
      new ApiError(
        `This doctor account no longer exists. Please login again.`,
        404
      )
    );
  }

  const parent = await Parent.findById(currentDoctor.parent);

  if (parent.passwordChangedAtForDoctor) {
    const passChangedTimestamp = parseInt(
      parent.passwordChangedAtForDoctor.getTime() / 1000,
      10
    );
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          `User recently changed his password, please login again..`,
          401
        )
      );
    }
  }

  req.doctor = currentDoctor;

  next();
});

// @desc:  Authorization[user Permission]
//["manger","admin"]
exports.allowedToParent = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.parent.role)) {
      return next(new ApiError("you are not allow to access this route", 403));
    }
    next();
  });

exports.allowedToForDoctor = (...roles) =>
  asyncHandler(async (req, res, next) => {
    const parent = await Parent.findOne({ _id: req.doctor.parent });
    if (!roles.includes(parent.role)) {
      return next(new ApiError("you are not allow to access this route", 403));
    }
    next();
  });

/**
 * Forgot Password Reset Code
 * @router Post /api/v1/auth/forgotPassword
 * @access public/parent
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  //*1- Get User by email
  const parent = await Parent.findOne({ email: req.body.email });
  if (!parent) {
    return next(
      new ApiError(`There is no user for this email ${req.body.email}`, 404)
    );
  }
  //*2-if user exist, Generate reset random 6 digit and save it in
  const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  //* save hashed password rest code into db
  parent.passwordResetCode = hashResetCode;
  //* add expiration time for password reset code (10 mints)
  parent.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  parent.passwordResetVerfied = false;
  parent.save();
  //*3-send the reset code via email
  let message = `Hi ${parent.userName},\n We received a request to reset the password on your ASD Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The ASD Team`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: "Your password reset code(valide for 10 mints)",
      message,
    });
  } catch (error) {
    parent.passwordResetCode = undefined;
    parent.passwordResetExpire = undefined;
    parent.passwordResetVerfied = undefined;
    await parent.save();
    return next(new ApiError(`There is an error in sending email`, 500));
  }

  req.email = req.body.email;

  next();
});

exports.resendResetCode = asyncHandler(async (req, res, next) => {
  const email = req.email;

  const parent = await Parent.findOne({ email });
  if (!parent) {
    return next(new ApiError("This email does not exist", 404));
  }

  const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  parent.passwordResetCode = hashResetCode;
  parent.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  await parent.save();

  const message = `Hi ${parent.userName},\nHere is your password reset code: ${resetCode}\nThis code is valid for 10 minutes.\nThe ASD Team`;

  await sendEmail({
    email,
    subject: "Resend Password Reset Code",
    message,
  });

  res.status(200).json({
    status: "success",
    message: "Reset code resent to your email",
  });
});

/**
 * Verify Password Reset Code
 * @router Post /api/v1/auth/verifyPassword
 * @access public/parent
 */
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  //*1-Get user based on reset code

  const hashResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const parent = await Parent.findOne({
    passwordResetCode: hashResetCode,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!parent) {
    return next(new ApiError(`Reset code invalid or expired`, 404));
  }
  parent.passwordResetVerfied = true;
  await parent.save();

  res.status(200).json({ message: "Verify Success.." });
});
/**
 * Reset Password
 * @router POST /api/v1/auth/resetPassword
 * @access Public/Parent
 */
exports.resetPasseword = asyncHandler(async (req, res, next) => {
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return next(
      new ApiError("New password and confirmation are required", 400)
    );
  }

  if (newPassword !== confirmPassword) {
    return next(new ApiError("Passwords do not match", 400));
  }

  const parent = await Parent.findOne({
    passwordResetVerfied: true,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!parent) {
    return next(new ApiError("Reset code is not verified or has expired", 400));
  }

  parent.password = newPassword;
  parent.passwordResetCode = undefined;
  parent.passwordResetExpire = undefined;
  parent.passwordResetVerfied = undefined;

  await parent.save();

  const token = createToken(parent._id);

  res.status(200).json({
    message: "Password has been successfully reset",
    token,
  });
});
