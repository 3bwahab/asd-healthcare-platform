const express = require("express");
const {
  createArticle,
  getAllArticles,
  getSpecificArticle,
  updateSpecificArticle,
  deleteSpecificArticle,
  uploadToCaloud,
  uploadUserImage,
} = require("../services/educationServices");

const {
  createEducationValidator,
  deleteEducationValidator,
  getEducationValidator,
  updateEducationValidator,
} = require("../utils/validator/educationValidator");
const AuthServices = require("../services/authServices");

const router = express.Router();
router.use(
  AuthServices.protectForParent,
  AuthServices.allowedToParent("parent")
);

router
  .route("/")
  .get(getAllArticles)
  .post(
    uploadUserImage,
    uploadToCaloud,
    createEducationValidator,
    createArticle
  );

router
  .route("/:id")
  .get(getEducationValidator, getSpecificArticle)
  .put(updateEducationValidator, updateSpecificArticle)
  .delete(deleteEducationValidator, deleteSpecificArticle);

module.exports = router;
