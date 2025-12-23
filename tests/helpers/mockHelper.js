/**
 * Mock Helper for Testing
 * Provides utilities for mocking external services
 */

const nock = require("nock");

/**
 * Mock FastAPI GET question endpoint
 * @param {number} index - Question index
 * @param {Object} responseData - Mock response data
 */
const mockFastAPIGetQuestion = (index, responseData = null) => {
  const defaultResponse = {
    question: `Test question ${index}?`,
    index,
    category: "social_interaction",
  };

  nock(process.env.FASTAPI_URL || "http://localhost:8080")
    .get(`/get_question/${index}`)
    .reply(200, responseData || defaultResponse);
};

/**
 * Mock FastAPI check relevance endpoint
 * @param {Object} responseData - Mock response data
 */
const mockFastAPICheckRelevance = (responseData = null) => {
  const defaultResponse = {
    relevant: true,
    confidence: 0.95,
  };

  nock(process.env.FASTAPI_URL || "http://localhost:8080")
    .post("/check_relevance")
    .reply(200, responseData || defaultResponse);
};

/**
 * Mock FastAPI process answer endpoint
 * @param {Object} responseData - Mock response data
 */
const mockFastAPIProcessAnswer = (responseData = null) => {
  const defaultResponse = {
    processed_value: 2,
    mapped_answer: "sometimes",
  };

  nock(process.env.FASTAPI_URL || "http://localhost:8080")
    .post("/process_answer")
    .reply(200, responseData || defaultResponse);
};

/**
 * Mock FastAPI final prediction endpoint
 * @param {Object} responseData - Mock response data
 */
const mockFastAPIFinalPrediction = (responseData = null) => {
  const defaultResponse = {
    prediction: "Moderate risk - Further evaluation recommended",
    confidence: 0.78,
    risk_level: "moderate",
    recommendations: [
      "Schedule consultation with developmental pediatrician",
      "Consider comprehensive ASD assessment",
    ],
  };

  nock(process.env.FASTAPI_URL || "http://localhost:8080")
    .post("/final_prediction")
    .reply(200, responseData || defaultResponse);
};

/**
 * Mock Stripe checkout session creation
 * @param {Object} responseData - Mock response data
 */
const mockStripeCheckoutSession = (responseData = null) => {
  const defaultResponse = {
    id: "cs_test_mock_session_id",
    url: "https://checkout.stripe.com/pay/cs_test_mock",
    payment_status: "unpaid",
    amount_total: 10000,
    currency: "usd",
  };

  return responseData || defaultResponse;
};

/**
 * Mock Cloudinary upload
 * @param {Object} responseData - Mock response data
 */
const mockCloudinaryUpload = (responseData = null) => {
  const defaultResponse = {
    secure_url:
      "https://res.cloudinary.com/test/image/upload/v123/test-image.jpg",
    public_id: "test-public-id-123",
    format: "jpg",
    width: 800,
    height: 600,
  };

  return responseData || defaultResponse;
};

/**
 * Mock email sending
 * @param {Object} responseData - Mock response data
 */
const mockEmailSend = (responseData = null) => {
  const defaultResponse = {
    messageId: "test-message-id-123",
    accepted: ["recipient@test.com"],
    rejected: [],
    response: "250 Message accepted",
  };

  return responseData || defaultResponse;
};

/**
 * Clear all nock mocks
 */
const clearAllMocks = () => {
  nock.cleanAll();
};

/**
 * Check if all nock mocks have been used
 * @returns {boolean} - True if all mocks used
 */
const allMocksUsed = () => {
  return nock.isDone();
};

module.exports = {
  mockFastAPIGetQuestion,
  mockFastAPICheckRelevance,
  mockFastAPIProcessAnswer,
  mockFastAPIFinalPrediction,
  mockStripeCheckoutSession,
  mockCloudinaryUpload,
  mockEmailSend,
  clearAllMocks,
  allMocksUsed,
};
