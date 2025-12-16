const express = require("express");

const {
  createChild,
  deleteSpecificChild,
  getAllChilds,
  getSpecificChild,
  updateSpecificChild,
  setParentIdToBody,
  createFilterObj,
  deleteAllChild,
} = require("../services/childServices");

const {
  createChildValidator,
  getChildValidator,
  updateChildValidator,
  deleteChildValidator,
} = require("../utils/validator/childValidator");

const AuthServices = require("../services/authServices");

const router = express.Router({ mergeParams: true });
// const router = express.Router();

router
  .route("/")
  .post(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    setParentIdToBody,
    createChildValidator,
    createChild
  )
  .get(createFilterObj, getAllChilds)
  .delete(deleteAllChild);
router
  .route("/:id")
  .get(getChildValidator, getSpecificChild)
  .put(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    updateChildValidator,
    updateSpecificChild
  )
  .delete(
    AuthServices.protectForParent,
    AuthServices.allowedToParent("parent"),
    deleteChildValidator,
    deleteSpecificChild
  );

module.exports = router;
