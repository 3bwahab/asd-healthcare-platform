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
    userName: overrides.userName || `Dr. ${faker.person.fullName().substring(0, 18)}`, // Max 20 chars
    email: faker.internet.email().toLowerCase(),
    password: hashedPassword,
    passwordConfirmation: hashedPassword,
    age: faker.number.int({ min: 28, max: 65 }), // Doctor age requirement
    phone: `+2${faker.string.numeric(10)}`,
    address: faker.location.streetAddress({ useFullAddress: true }),
    specialization: faker.helpers.arrayElement(specializations),
    experienceYears: faker.number.int({ min: 2, max: 30 }),
    clinicAddress: faker.location.streetAddress({ useFullAddress: true }),
    consultationFee: faker.number.int({ min: 200, max: 1000 }),
    bio: faker.lorem.paragraph(),
    certification: "Board Certified",
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
  for (let i = 0; i < count; i += 1) {
    // eslint-disable-next-line no-await-in-loop
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
  for (let i = 0; i < count; i += 1) {
    // eslint-disable-next-line no-await-in-loop
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
