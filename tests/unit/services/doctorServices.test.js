/**
 * Unit Tests for doctorServices
 * Tests doctor user CRUD operations
 */

const doctorServices = require("../../../services/doctorServices");
const Doctor = require("../../../models/doctorModel");
const Parent = require("../../../models/parentModel");
const Child = require("../../../models/childModel"); // Import Child model to avoid schema error
const Review = require("../../../models/reviewModel"); // Import Review model for virtual populate
const {
  connect,
  closeDatabase,
  clearDatabase,
} = require("../../helpers/dbHelper");
const {
  createParent,
  createDoctor,
} = require("../../factories/userFactory");

describe("doctorServices", () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  // Helper function to create a test doctor
  const createTestDoctor = async (overrides = {}) => {
    const doctorData = await createDoctor(overrides);

    const parentRecord = await Parent.create({
      userName: doctorData.userName,
      email: doctorData.email,
      phone: doctorData.phone,
      password: "TestPass123!",
      age: doctorData.age,
      address: doctorData.address,
      emailResetVerfied: true,
    });

    const doctor = await Doctor.create({
      parent: parentRecord._id,
      speciailization: doctorData.specialization,
      qualifications: doctorData.certification || "Board Certified",
      medicalLicense: "test-license-12345.pdf",
      Session_price: doctorData.consultationFee || 500,
    });

    return { doctor, parent: parentRecord };
  };

  describe("getAllDoctors", () => {
    test("should return all doctors with pagination", async () => {
      // Create 3 test doctors
      await createTestDoctor({ userName: "Dr. One" });
      await createTestDoctor({ userName: "Dr. Two" });
      await createTestDoctor({ userName: "Dr. Three" });

      const req = {
        query: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await doctorServices.getAllDoctors(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.results).toBe(3);
      expect(response.data).toHaveLength(3);
    });

    test("should return paginated results with limit", async () => {
      // Create 5 test doctors
      for (let i = 0; i < 5; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await createTestDoctor({ userName: `Dr. Doctor ${i}` });
      }

      const req = {
        query: { limit: "2", page: "1" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await doctorServices.getAllDoctors(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.results).toBe(2);
      expect(response.data).toHaveLength(2);
    });
  });

  describe("getSpecificDoctor", () => {
    test("should return specific doctor by ID", async () => {
      const { doctor, parent } = await createTestDoctor({
        userName: "Dr. Smith",
      });

      const req = {
        params: { id: doctor._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await doctorServices.getSpecificDoctor(req, res, next);

      // If next was called with an error, fail the test
      if (next.mock.calls.length > 0 && next.mock.calls[0][0]) {
        throw next.mock.calls[0][0];
      }

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.speciailization).toBeDefined();
    });

    test("should return error for non-existent doctor ID", async () => {
      const req = {
        params: { id: "507f1f77bcf86cd799439011" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await doctorServices.getSpecificDoctor(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("No document");
    });
  });

  describe("updateSpecificDoctor", () => {
    test("should update doctor data", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Jones" });

      const req = {
        params: { id: doctor._id.toString() },
        body: {
          speciailization: "Child Psychology",
          Session_price: 600,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await doctorServices.updateSpecificDoctor(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedDoctor = await Doctor.findById(doctor._id);
      expect(updatedDoctor.speciailization).toBe("Child Psychology");
      expect(updatedDoctor.Session_price).toBe(600);
    });
  });

  describe("deleteSpecificDoctor", () => {
    test("should delete doctor", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Delete" });

      const req = {
        params: { id: doctor._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await doctorServices.deleteSpecificDoctor(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const deletedDoctor = await Doctor.findById(doctor._id);
      expect(deletedDoctor).toBeNull();
    });
  });

  describe("getLoggedDoctorData", () => {
    test("should return logged doctor data", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Logged" });

      const req = {
        doctor: { _id: doctor._id },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await doctorServices.getLoggedDoctorData(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.speciailization).toBeDefined();
    });
  });

  describe("updateLoggedDoctorPassword", () => {
    test("should update logged doctor password", async () => {
      const { doctor, parent } = await createTestDoctor({
        userName: "Dr. Password",
      });

      const req = {
        doctor: { _id: doctor._id, parent: parent._id },
        body: {
          password: "NewSecurePass123!",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await doctorServices.updateLoggedDoctorPassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedParent = await Parent.findById(parent._id);
      expect(updatedParent.passwordChangedAtForDoctor).toBeDefined();
    });
  });

  describe("updateLoggedDoctorData", () => {
    test("should update logged doctor profile data", async () => {
      const { doctor, parent } = await createTestDoctor({
        userName: "Dr. Update",
      });

      const req = {
        doctor: { _id: doctor._id },
        body: {
          userName: "Dr. Updated Name",
          speciailization: "Updated Specialization",
          qualifications: "Updated Qualifications",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await doctorServices.updateLoggedDoctorData(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedDoctor = await Doctor.findById(doctor._id);
      expect(updatedDoctor.speciailization).toBe("Updated Specialization");
      expect(updatedDoctor.qualifications).toBe("Updated Qualifications");
    });
  });

  describe("deleteLoggedDoctorData", () => {
    test("should deactivate logged doctor account", async () => {
      const { doctor, parent } = await createTestDoctor({
        userName: "Dr. Deactivate",
      });

      const req = {
        doctor: { _id: doctor._id, parent: parent._id },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await doctorServices.deleteLoggedDoctorData(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedParent = await Parent.findById(parent._id);
      expect(updatedParent.active).toBe(false);
    });
  });

  describe("activateLoggedDoctorData", () => {
    test("should reactivate logged doctor account", async () => {
      const { doctor, parent } = await createTestDoctor({
        userName: "Dr. Reactivate",
      });

      // First deactivate
      await Parent.findByIdAndUpdate(parent._id, { active: false });

      const req = {
        doctor: { _id: doctor._id, parent: parent._id },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await doctorServices.activateLoggedDoctorData(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedParent = await Parent.findById(parent._id);
      expect(updatedParent.active).toBe(true);
    });
  });
});
