/**
 * Jest Global Setup
 * Runs before all tests to configure the test environment
 */

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET_KEY = "test-jwt-secret-key-for-testing-only";
process.env.JWT_EXPIRE_TIME = "90d";
process.env.PORT = "8001"; // Different port for testing

// Mock environment variables for external services
process.env.CLOUD_NAME = "test-cloudinary";
process.env.API_KEY = "test-api-key";
process.env.API_SECRET = "test-api-secret";
process.env.STRIPE_SECRET = "sk_test_mock";
process.env.EMAIL_HOST = "smtp.test.com";
process.env.EMAIL_PORT = "587";
process.env.EMAIL_USER = "test@example.com";
process.env.EMAIL_PASSWORD = "test-password";
process.env.FASTAPI_URL = "http://localhost:8080";

// Increase test timeout for integration tests
jest.setTimeout(30000);

// Suppress console logs during tests (optional - comment out for debugging)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Mock Cloudinary
jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: "https://res.cloudinary.com/test/image/upload/v123/test.jpg",
        public_id: "test-public-id",
      }),
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));

// Mock Nodemailer
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: "test-message-id",
      accepted: ["test@example.com"],
      rejected: [],
      response: "250 Message accepted",
    }),
  }),
}));

// Mock Stripe
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: "cs_test_mock_session_id",
          url: "https://checkout.stripe.com/pay/cs_test_mock",
          payment_status: "unpaid",
          amount_total: 10000,
          currency: "usd",
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: "cs_test_mock_session_id",
          payment_status: "paid",
          customer_details: {
            email: "test@example.com",
          },
        }),
      },
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_mock_session_id",
            payment_status: "paid",
            metadata: {
              appointmentId: "test-appointment-id",
            },
          },
        },
      }),
    },
  }));
});

console.log("✅ Jest test environment configured");
