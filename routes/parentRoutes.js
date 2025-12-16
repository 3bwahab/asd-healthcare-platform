const express = require("express");

const {
  createParent,
  getAllParents,
  getSpecificParent,
  updateParent,
  changePassword,
  deleteParent,
  deleteAllParent,
  getLoggedParentData,
  updateLoggedParentPassword,
  updateLoggedParentData,
  deleteLoggedParentData,
  activateLoggedParentData,
  uploadParentImage,
  uploadToCaloud,
} = require("../services/parentServices");

const AuthServices = require("../services/authServices");

const childRoute = require("./childRoutes");

const {
  createParentValidator,
  geteParentValidator,
  updateParentValidator,
  changePasswordValidator,
  deleteParentValidator,
  changeLoggedParentPasswordValidator,
  updateLoggedParentDataValidator,
} = require("../utils/validator/parentValidator");
const router = express();

//* Nested Route
router.use("/:parentId/childs", childRoute);

router
  .route("/getMe")
  .get(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    getLoggedParentData
  );
router
  .route("/updateMypassword")
  .put(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    changeLoggedParentPasswordValidator,
    updateLoggedParentPassword
  );

router
  .route("/updateMe")
  .put(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    uploadParentImage,
    uploadToCaloud,
    updateLoggedParentDataValidator,
    updateLoggedParentData
  );

router
  .route("/deleteMe")
  .put(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    deleteLoggedParentData
  );

router
  .route("/activeMe")
  .put(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    activateLoggedParentData
  );

//*Admin
// router.use(AuthServices.protectForUser, AuthServices.allowedToParent("admin"));
router
  .route("/")
  .post(uploadParentImage, uploadToCaloud, createParentValidator, createParent)
  .get(getAllParents)
  .delete(deleteAllParent);
router
  .route("/:id")
  .get(geteParentValidator, getSpecificParent)
  .put(uploadParentImage, uploadToCaloud, updateParentValidator, updateParent)
  .delete(deleteParentValidator, deleteParent);

router
  .route("/changePassword/:id")
  .put(changePasswordValidator, changePassword);

module.exports = router;
