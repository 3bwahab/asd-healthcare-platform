/**
 * User Factory for Test Data Generation
 * Creates realistic test user data using Faker
 */

const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");

/**
 * Generate parent user data
 * @param {Object} overrides - Optional field overrides
 * @returns {Object} - Parent user data
 */
const createParent = async (overrides = {}) => {
  const password = overrides.password || "TestPass123!";
  const hashedPassword = await bcrypt.hash(password, 10);

  return {
    userName: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: hashedPassword,
    passwordConfirmation: hashedPassword,
    age: faker.number.int({ min: 25, max: 60 }),
    phone: `+2${faker.string.numeric(10)}`,
    address: faker.location.streetAddress({ useFullAddress: true }),
    role: "parent",
    emailVerified: true,
    active: true,
    ...overrides,
    // Keep plain password for login testing
    plainPassword: password,
  };
};

/**
 * Generate doctor user data
 * @param {Object} overrides - Optional field overrides
 * @returns {Object} - Doctor user data
 */
const createDoctor = async (overrides = {}) => {
  const password = overrides.password || "DoctorPass123!";
  const hashedPassword = await bcrypt.hash(password, 10);

  const specializations = [
    "Behavioral Therapy",
    "Occupational Therapy",
    "Speech Therapy",
    "Applied Behavior Analysis (ABA)",
    "Developmental Pediatrics",
    "Child Psychology",
  ];

  return {
    doctorName: `Dr. ${faker.person.fullName()}`,
    email: faker.internet.email().toLowerCase(),
    password: hashedPassword,
    passwordConfirmation: hashedPassword,
    specialization: faker.helpers.arrayElement(specializations),
    phone: `+2${faker.string.numeric(10)}`,
    address: faker.location.streetAddress({ useFullAddress: true }),
    experience: faker.number.int({ min: 2, max: 30 }),
    certification: "Board Certified",
    bio: faker.lorem.paragraph(),
    rating: faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }),
    role: "doctor",
    emailVerified: true,
    active: true,
    ...overrides,
    // Keep plain password for login testing
    plainPassword: password,
  };
};

/**
 * Generate multiple parent users
 * @param {number} count - Number of parents to create
 * @returns {Promise<Array>} - Array of parent user data
 */
const createParents = async (count) => {
  const parents = [];
  for (let i = 0; i < count; i++) {
    parents.push(await createParent());
  }
  return parents;
};

/**
 * Generate multiple doctor users
 * @param {number} count - Number of doctors to create
 * @returns {Promise<Array>} - Array of doctor user data
 */
const createDoctors = async (count) => {
  const doctors = [];
  for (let i = 0; i < count; i++) {
    doctors.push(await createDoctor());
  }
  return doctors;
};

module.exports = {
  createParent,
  createDoctor,
  createParents,
  createDoctors,
};
