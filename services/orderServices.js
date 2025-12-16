const stripe = require("stripe")(process.env.STRIPE_SECRET);

const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");

const Order = require("../models/orderModel");
const Parent = require("../models/parentModel");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");

// * 1- @desc Create Session Cash Order
exports.createSessionCashOrder = asyncHandler(async (req, res, next) => {
  //* 1- get doctor by doctor Id
  const doctorId = req.body.doctor;
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(new ApiError(`there is no doctor for this id: ${doctorId}`));
  }
  //* 2- get doctor Price
  const PriceOfSession = doctor.Session_price;

  //* 3- create order
  const order = await Order.create({
    parent: req.parent._id,
    doctor: doctorId,
    price: PriceOfSession,
  });

  res.status(200).json({ status: "Order Created", data: order });
});
// * 2- @desc Get All Session Cash Order
exports.getAllSessionOrder = factory.getAll(Order);
// * 3- @desc Specific Session Cash Order
exports.getSpecificSessionOrder = factory.getOne(Order);
// * 4- @desc update session order paid status to paid
exports.updateSessionToPaid = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new ApiError(`there is no order for this id: ${orderId}`, 404));
  }
  order.isPaid = true;
  order.paidAt = Date.now();
  const updateOrder = await order.save();

  res.status(200).json({ status: "Success", data: updateOrder });
});

//* 5- @desc get checkout session from stripe and send it as response
//*    @route /api/v1/orders/checkout-session/doctorId

exports.checkoutSession = asyncHandler(async (req, res, next) => {
  //*1 - get doctor by doctorId in params and get the session Price
  const doctorId = req.params.doctorId;
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(new ApiError(`there is no doctor for this id: ${doctorId}`));
  }

  const totalSessionPrice = doctor.Session_price;

  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: totalSessionPrice * 100,
          product_data: {
            name: req.parent.userName,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/api/v1/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/v1/appointment`,
    customer_email: req.parent.email,
    client_reference_id: doctorId,
    metadata: {
      parentName: req.parent.userName,
    },
  });

  // 4) send session to response
  res.status(200).json({ status: "success", session });
});

// @desc    Generate Stripe Payment Sheet for mobile payment
// @route   GET /api/v1/payment-sheet/:doctorId
// @access  Private/Parent
exports.paymentSheet = asyncHandler(async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId;

    // 1) Get doctor by ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return next(new ApiError(`There is no doctor for this ID: ${doctorId}`));
    }

    const totalSessionPrice = doctor.Session_price * 100; // Convert to piastres

    // 2) Create a Stripe customer
    const customer = await stripe.customers.create();

    // 3) Create an ephemeral key for mobile apps
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2023-10-16" }
    );

    // 4) Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalSessionPrice,
      currency: "egp",
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        doctorId: doctor._id.toString(),
        parentId: req.parent._id.toString(), // لو مسجل الدخول
      },
    });

    // 5) Send response
    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLIC,
    });
  } catch (error) {
    console.log(error);
    return res.json({ error: true, message: error.message, data: null });
  }
});

const createCardOrderForWeb = async (session) => {
  const doctorId = session.client_reference_id;
  const doctor = await Doctor.findById(doctorId);

  const sessionPrice = doctor.Session_price;

  const parent = await Parent.findOne({ email: session.customer_email });
  if (!parent) {
    console.error(`Parent not found with email: ${session.customer_email}`);
    return;
  }

  // 3) Create order with default paymentMethodType card
  const order = await Order.create({
    parent: parent._id,
    doctor: doctorId,
    price: sessionPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });

  console.log(order);
};

const createCardOrderForMobile = async (paymentIntent) => {
  // 1) Get metadata values from PaymentIntent
  const doctorId = paymentIntent.metadata?.doctorId;
  const parentId = paymentIntent.metadata?.parentId;

  if (!doctorId || !parentId) {
    console.error("Missing doctorId or parentId in metadata.");
    return;
  }

  // 2) Find doctor and parent from database
  const doctor = await Doctor.findById(doctorId);
  const parent = await Parent.findById(parentId);

  if (!doctor || !parent) {
    console.error("Doctor or Parent not found.");
    return;
  }

  // 3) Get session price from doctor
  const sessionPrice = doctor.Session_price;

  // 4) Create the order
  const order = await Order.create({
    parent: parent._id,
    doctor: doctor._id,
    price: sessionPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });

  console.log("Order created successfully:", order);
};

exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    try {
      await createCardOrderForMobile(paymentIntent);
    } catch (err) {
      console.error("Failed to create order:", err);
    }
  }
  if (event.type === "checkout.session.completed") {
    await createCardOrderForWeb(event.data.object);
  }

  res.status(200).json({ received: true });
});
