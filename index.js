const path = require("path");

const express = require("express");

const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

const morgan = require("morgan");
const cors = require("cors");

const ApiError = require("./utils/apiError");
const globalError = require("./middlware/errMiddlware");
const dbConnection = require("./config/database");

//* import our routes
const parentRoute = require("./routes/parentRoutes");
const childRoutes = require("./routes/childRoutes");
const authRoute = require("./routes/authRoutes");
const doctorRoute = require("./routes/doctorRoutes");
const appointmentRoute = require("./routes/appointmentRoutes");
const reviewRoute = require("./routes/reviewRoutes");
const pharmacyRoute = require("./routes/pharmacyRoutes");
const medicanRoute = require("./routes/medicanRoutes ");
const educationRoute = require("./routes/educationRouter");
const sessionRoute = require("./routes/sessionRoutes");
const sessionReviewRoute = require("./routes/sessionReviewRoutes");
const charityRoute = require("./routes/charityRoutes");
const orderRoute = require("./routes/orderRoutes");
const { webhookCheckout } = require("./services/orderServices");
//*------
const aiRoute = require("./routes/AiRoutes/aiRoutes");

//* DB Connection
dbConnection();

//*Express app
const app = express();

app.use(cors());
app.options("*", cors());

//* webhookCheckout
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

//* Middlwares
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.MODE_ENV == "development") {
  app.use(morgan("dev"));
  console.log(`Mode: ${process.env.MODE_ENV}`);
}

//*Mount Routes
app.use("/api/v1/parents", parentRoute);
app.use("/api/v1/childs", childRoutes);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/doctors", doctorRoute);
app.use("/api/v1/appointment", appointmentRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/pharmacy", pharmacyRoute);
app.use("/api/v1/medican", medicanRoute);
app.use("/api/v1/articles", educationRoute);
app.use("/api/v1/sessions", sessionRoute);
app.use("/api/v1/sessionReview", sessionReviewRoute);
app.use("/api/v1/charities", charityRoute);
app.use("/api/v1/orders", orderRoute);
//*-----------------------------------------------
app.use("/api/v1/ai", aiRoute);

//* Mount Routes
app.get("/", (req, res) => {
  res.send("<h1>صلي علي النبي </h1>");
});

app.all("*", (req, res, next) => {
  next(new ApiError(`can't find this route: ${req.originalUrl}`, 400));
});

//*Global error handel Middlware(inside the express)
app.use(globalError);

const PORT = process.env.PORT || 8000;

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  const server = app.listen(PORT, () => {
    console.log(`App Running On PORT: ${PORT}`);
  });

  //* Global error handle Middleware (outside the express || mongodb || Server Error)
  process.on("unhandledRejection", (err) => {
    console.error(`unhandledRejection Errors: ${err.name} | ${err.message}`);

    server.close(() => {
      console.error(`Shutting down....`);
      process.exit(1);
    });
  });
}

// Export the Express app for Vercel
module.exports = app;
