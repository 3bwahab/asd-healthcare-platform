/**
 * Session Factory for Test Data Generation
 * Creates realistic test session data using Faker
 */

const { faker } = require("@faker-js/faker");

/**
 * Generate session data
 * @param {string} appointmentId - Appointment ID
 * @param {string} doctorId - Doctor user ID
 * @param {string} childId - Child ID
 * @param {Object} overrides - Optional field overrides
 * @returns {Object} - Session data
 */
const createSession = (appointmentId, doctorId, childId, overrides = {}) => {
  return {
    appointmentId,
    doctorId,
    childId,
    sessionDate: faker.date.recent(),
    duration: faker.number.int({ min: 30, max: 120 }),
    notes: faker.lorem.paragraph(),
    recommendations: faker.lorem.sentences(3),
    progress: faker.lorem.paragraph(),
    ...overrides,
  };
};

/**
 * Generate review data
 * @param {string} parentId - Parent user ID
 * @param {string} doctorId - Doctor user ID
 * @param {Object} overrides - Optional field overrides
 * @returns {Object} - Review data
 */
const createReview = (parentId, doctorId, overrides = {}) => {
  return {
    parentId,
    doctorId,
    rating: faker.number.int({ min: 1, max: 5 }),
    comment: faker.lorem.paragraph(),
    ...overrides,
  };
};

/**
 * Generate session review data
 * @param {string} sessionId - Session ID
 * @param {string} parentId - Parent user ID
 * @param {Object} overrides - Optional field overrides
 * @returns {Object} - Session review data
 */
const createSessionReview = (sessionId, parentId, overrides = {}) => {
  return {
    sessionId,
    parentId,
    rating: faker.number.int({ min: 1, max: 5 }),
    feedback: faker.lorem.paragraph(),
    ...overrides,
  };
};

/**
 * Generate multiple sessions
 * @param {string} appointmentId - Appointment ID
 * @param {string} doctorId - Doctor user ID
 * @param {string} childId - Child ID
 * @param {number} count - Number of sessions to create
 * @returns {Array} - Array of session data
 */
const createSessions = (appointmentId, doctorId, childId, count) => {
  const sessions = [];
  for (let i = 0; i < count; i++) {
    sessions.push(createSession(appointmentId, doctorId, childId));
  }
  return sessions;
};

/**
 * Generate multiple reviews
 * @param {string} parentId - Parent user ID
 * @param {string} doctorId - Doctor user ID
 * @param {number} count - Number of reviews to create
 * @returns {Array} - Array of review data
 */
const createReviews = (parentId, doctorId, count) => {
  const reviews = [];
  for (let i = 0; i < count; i++) {
    reviews.push(createReview(parentId, doctorId));
  }
  return reviews;
};

module.exports = {
  createSession,
  createReview,
  createSessionReview,
  createSessions,
  createReviews,
};
