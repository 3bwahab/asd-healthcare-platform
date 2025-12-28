const express = require("express");

const router = express.Router();

const {
  uploadCharityLogo,
  uploadToCaloud,
  createCharity,
  getAllCharities,
  getSpecificCharity,
  updateSpecificCharity,
  deleteSpecificCharity,
  getAllMedicianForSpecificCharity,
} = require("../services/charityServices");

const {
  createCharityValidator,
  getCharityValidator,
  updateCharityValidator,
  deleteCharityValidator,
} = require("../utils/validator/charityValidator");

// const AuthServices = require("../services/authServices");

// router.use(
//   AuthServices.protectForParent,
//   AuthServices.allowedToParent("parent")
// );

router
  .route("/")
  .post(
    uploadCharityLogo,
    uploadToCaloud,
    createCharityValidator,
    createCharity
  )
  .get(getAllCharities);

router
  .route("/:id")
  .get(getCharityValidator, getSpecificCharity)
  .put(
    uploadCharityLogo,
    uploadToCaloud,
    updateCharityValidator,
    updateSpecificCharity
  )
  .delete(deleteCharityValidator, deleteSpecificCharity);
router
  .route("/getAllMedicanForCharity/:charityId")
  .get(getAllMedicianForSpecificCharity);

module.exports = router;
