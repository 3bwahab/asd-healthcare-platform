/**
 * Appointment Factory for Test Data Generation
 * Creates realistic test appointment data using Faker
 */

const { faker } = require("@faker-js/faker");

/**
 * Generate appointment data
 * @param {string} parentId - Parent user ID
 * @param {string} doctorId - Doctor user ID
 * @param {string} childId - Child ID
 * @param {Object} overrides - Optional field overrides
 * @returns {Object} - Appointment data
 */
const createAppointment = (parentId, doctorId, childId, overrides = {}) => {
  const appointmentDate = faker.date.future();
  const statuses = ["pending", "confirmed", "completed", "cancelled"];

  return {
    parentId,
    doctorId,
    childId,
    appointmentDate,
    reason: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(statuses),
    notes: faker.lorem.paragraph(),
    ...overrides,
  };
};

/**
 * Generate child data
 * @param {string} parentId - Parent user ID
 * @param {Object} overrides - Optional field overrides
 * @returns {Object} - Child data
 */
const createChild = (parentId, overrides = {}) => {
  const genders = ["male", "female"];
  const diagnosisLevels = ["ASD Level 1", "ASD Level 2", "ASD Level 3"];

  return {
    childName: faker.person.firstName(),
    childAge: faker.number.int({ min: 2, max: 12 }),
    childGender: faker.helpers.arrayElement(genders),
    diagnosis: faker.helpers.arrayElement(diagnosisLevels),
    medicalHistory: faker.lorem.paragraph(),
    parentId,
    ...overrides,
  };
};

/**
 * Generate multiple children
 * @param {string} parentId - Parent user ID
 * @param {number} count - Number of children to create
 * @returns {Array} - Array of child data
 */
const createChildren = (parentId, count) => {
  const children = [];
  for (let i = 0; i < count; i += 1) {
    children.push(createChild(parentId));
  }
  return children;
};

/**
 * Generate multiple appointments
 * @param {string} parentId - Parent user ID
 * @param {string} doctorId - Doctor user ID
 * @param {string} childId - Child ID
 * @param {number} count - Number of appointments to create
 * @returns {Array} - Array of appointment data
 */
const createAppointments = (parentId, doctorId, childId, count) => {
  const appointments = [];
  for (let i = 0; i < count; i += 1) {
    appointments.push(createAppointment(parentId, doctorId, childId));
  }
  return appointments;
};

module.exports = {
  createAppointment,
  createChild,
  createChildren,
  createAppointments,
};
