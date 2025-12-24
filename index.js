const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");

// Load environment variables
dotenv.config({ path: "config.env" });

// Custom utilities
const ApiError = require("./utils/apiError");
const globalError = require("./middleware/errorMiddleware");
const dbConnection = require("./config/database");

// Import routes
const parentRoute = require("./routes/parentRoutes");
const childRoutes = require("./routes/childRoutes");
const authRoute = require("./routes/authRoutes");
const doctorRoute = require("./routes/doctorRoutes");
const appointmentRoute = require("./routes/appointmentRoutes");
const reviewRoute = require("./routes/reviewRoutes");
const pharmacyRoute = require("./routes/pharmacyRoutes");
const medicineRoute = require("./routes/medicineRoutes");
const educationRoute = require("./routes/educationRoutes");
const sessionRoute = require("./routes/sessionRoutes");
const sessionReviewRoute = require("./routes/sessionReviewRoutes");
const charityRoute = require("./routes/charityRoutes");
const orderRoute = require("./routes/orderRoutes");
const { webhookCheckout } = require("./services/orderServices");
const aiRoute = require("./routes/ai/aiRoutes");

// Connect to MongoDB
dbConnection();

// Initialize Express app
const app = express();

// CORS configuration - restrict to allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:3001"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.options("*", cors());

// Stripe webhook (must be before express.json())
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

// Development logging
if (process.env.MODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`🔧 Environment: ${process.env.MODE_ENV}`);
}

// Mount API routes
app.use("/api/v1/parents", parentRoute);
app.use("/api/v1/childs", childRoutes);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/doctors", doctorRoute);
app.use("/api/v1/appointment", appointmentRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/pharmacy", pharmacyRoute);
app.use("/api/v1/medicine", medicineRoute);
app.use("/api/v1/articles", educationRoute);
app.use("/api/v1/sessions", sessionRoute);
app.use("/api/v1/sessionReview", sessionReviewRoute);
app.use("/api/v1/charities", charityRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/ai", aiRoute);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "ASD Healthcare Management Platform API",
    version: "1.0.0",
    status: "active"
  });
});

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new ApiError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Global error handling middleware
app.use(globalError);

const PORT = process.env.PORT || 8000;

// Start server (skip in Vercel serverless environment)
if (process.env.VERCEL !== '1') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/v1`);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err) => {
    console.error(`❌ Unhandled Rejection: ${err.name} | ${err.message}`);
    server.close(() => {
      console.error("💥 Server shutting down...");
      process.exit(1);
    });
  });
}

// Export app for Vercel serverless deployment
module.exports = app;
