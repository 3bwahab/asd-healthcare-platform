/**
 * Authentication Helper for Testing
 * Provides utilities for creating test users and generating tokens
 */

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/**
 * Generate JWT token for testing
 * @param {string} userId - User ID to encode in token
 * @param {string} role - User role (parent, doctor)
 * @returns {string} - JWT token
 */
const generateToken = (userId, role = "parent") => {
  const payload = {
    userId,
    role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};

/**
 * Hash password for testing
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Create test parent user data
 * @returns {Object} - Parent user data
 */
const createTestParent = () => {
  return {
    userName: "Test Parent",
    email: "parent@test.com",
    password: "TestPass123!",
    age: 35,
    phone: "+201234567890",
    address: "123 Test St, Cairo, Egypt",
    role: "parent",
  };
};

/**
 * Create test doctor user data
 * @returns {Object} - Doctor user data
 */
const createTestDoctor = () => {
  return {
    doctorName: "Dr. Test Doctor",
    email: "doctor@test.com",
    password: "DoctorPass123!",
    specialization: "Behavioral Therapy",
    phone: "+201987654321",
    address: "456 Medical Center, Cairo, Egypt",
    experience: 10,
    certification: "Board Certified",
    role: "doctor",
  };
};

/**
 * Create test child data
 * @param {string} parentId - Parent user ID
 * @returns {Object} - Child data
 */
const createTestChild = (parentId) => {
  return {
    childName: "Test Child",
    childAge: 6,
    childGender: "male",
    diagnosis: "ASD Level 1",
    medicalHistory: "Diagnosed at age 4",
    parentId,
  };
};

/**
 * Decode JWT token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET_KEY);
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  createTestParent,
  createTestDoctor,
  createTestChild,
  decodeToken,
};
