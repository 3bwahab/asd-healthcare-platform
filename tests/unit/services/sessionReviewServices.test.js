/**
 * Unit Tests for sessionReviewServices
 * Tests session review functionality (add, remove, get reviews)
 */

const sessionReviewServices = require("../../../services/sessionReviewServices");
const Session = require("../../../models/sessionModel");
const Parent = require("../../../models/parentModel");
const Doctor = require("../../../models/doctorModel");
const Child = require("../../../models/childModel"); // Import Child model to avoid schema error
const {
  connect,
  closeDatabase,
  clearDatabase,
} = require("../../helpers/dbHelper");
const {
  createParent,
  createDoctor,
} = require("../../factories/userFactory");

describe("sessionReviewServices", () => {
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

  describe("addReviewToSession", () => {
    test("should add review to session", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Smith" });
      const parentData = await createParent({ userName: "Parent One" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const session = await Session.create({
        doctorId: doctor._id,
        parentId: parent._id,
        session_number: 1,
        session_date: "2024-12-25",
        statusOfSession: "coming",
        session_review: [],
      });

      const req = {
        parent: { _id: parent._id },
        params: { sessionId: session._id },
        body: {
          ratings: 5,
          title: "Excellent session!",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionReviewServices.addReviewToSession(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.status).toBe("Success");
      expect(response.data).toHaveLength(1);
      expect(response.data[0].ratings).toBe(5);
      expect(response.data[0].title).toBe("Excellent session!");
    });

    test("should reject invalid parent ID", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Jones" });
      const parentData = await createParent({ userName: "Parent Two" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const session = await Session.create({
        doctorId: doctor._id,
        parentId: parent._id,
        session_number: 1,
        session_date: "2024-12-25",
        statusOfSession: "coming",
        session_review: [],
      });

      const req = {
        parent: { _id: "507f1f77bcf86cd799439011" }, // Invalid parent ID
        params: { sessionId: session._id },
        body: {
          ratings: 5,
          title: "Test review",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionReviewServices.addReviewToSession(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("there is no parent");
    });

    test("should reject invalid session ID", async () => {
      const parentData = await createParent({ userName: "Parent Three" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const req = {
        parent: { _id: parent._id },
        params: { sessionId: "507f1f77bcf86cd799439011" }, // Invalid session ID
        body: {
          ratings: 5,
          title: "Test review",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionReviewServices.addReviewToSession(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("there is no session");
    });
  });

  describe("removeReviewFromSession", () => {
    test("should remove review from session", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Brown" });
      const parentData = await createParent({ userName: "Parent Four" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const session = await Session.create({
        doctorId: doctor._id,
        parentId: parent._id,
        session_number: 1,
        session_date: "2024-12-25",
        statusOfSession: "coming",
        session_review: [
          {
            parentId: parent._id,
            ratings: 5,
            title: "Great session",
          },
        ],
      });

      const reviewId = session.session_review[0]._id;

      const req = {
        params: { sessionId: session._id },
        body: { reviewId: reviewId.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionReviewServices.removeReviewFromSession(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.status).toBe("Success");
      expect(response.message).toBe("Session Review Deleted Successfully");
      expect(response.data).toHaveLength(0);
    });

    test("should reject invalid session ID when removing review", async () => {
      const req = {
        params: { sessionId: "507f1f77bcf86cd799439011" },
        body: { reviewId: "507f1f77bcf86cd799439012" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionReviewServices.removeReviewFromSession(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("there is no session");
    });
  });

  describe("getAllReviewOnSpecificSession", () => {
    test("should get all reviews for specific session", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Wilson" });
      const parentData = await createParent({ userName: "Parent Five" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const session = await Session.create({
        doctorId: doctor._id,
        parentId: parent._id,
        session_number: 1,
        session_date: "2024-12-25",
        statusOfSession: "coming",
        session_review: [
          {
            parentId: parent._id,
            ratings: 5,
            title: "Review 1",
          },
          {
            parentId: parent._id,
            ratings: 4,
            title: "Review 2",
          },
        ],
      });

      const req = {
        params: { sessionId: session._id },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionReviewServices.getAllReviewOnSpecificSession(
        req,
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.status).toBe("Success");
      expect(response.results).toBe(2);
      expect(response.data).toHaveLength(2);
    });

    test("should return error for non-existent session", async () => {
      const req = {
        params: { sessionId: "507f1f77bcf86cd799439011" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionReviewServices.getAllReviewOnSpecificSession(
        req,
        res,
        next
      );

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("There is no session");
    });
  });
});
