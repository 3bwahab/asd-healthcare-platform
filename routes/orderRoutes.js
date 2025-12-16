const express = require("express");

const {
  createSessionCashOrder,
  getAllSessionOrder,
  getSpecificSessionOrder,
  updateSessionToPaid,
  checkoutSession,
  webhookCheckout,
  paymentSheet,
} = require("../services/orderServices");

// const {
//   createMedicanValidator,
//   deleteMedicanValidator,
//   getMedicanValidator,
//   updateMedicanValidator,
// } = require("../utils/validator/medicanValidator ");

const AuthServices = require("../services/authServices");

const router = express.Router();
router.use(
  AuthServices.protectForParent,
  AuthServices.allowedToParent("parent")
);

router.route("/").post(createSessionCashOrder).get(getAllSessionOrder);
router.route("/:id").get(getSpecificSessionOrder);
router.route("/:id/pay").put(updateSessionToPaid);
router.route("/checkout-session/:doctorId").get(checkoutSession);
router.route("/paymentSheet/:doctorId").post(paymentSheet);

module.exports = router;
