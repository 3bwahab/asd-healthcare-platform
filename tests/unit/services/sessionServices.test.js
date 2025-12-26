/**
 * Unit Tests for sessionServices
 * Tests session management functionality for doctors and parents
 */

const sessionServices = require("../../../services/sessionServices");
const Session = require("../../../models/sessionModel");
const Doctor = require("../../../models/doctorModel");
const Parent = require("../../../models/parentModel");
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

describe("sessionServices", () => {
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

  describe("createSession", () => {
    test("should create session for doctor", async () => {
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

      const req = {
        doctor: { _id: doctor._id },
        body: {
          parentId: parent._id,
          session_number: 1,
          session_date: "2024-12-25",
          statusOfSession: "coming",
          comments: ["Initial session"],
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionServices.createSession(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      const response = res.json.mock.calls[0][0];
      expect(response.data.session_number).toBe(1);
      expect(response.data.doctorId.toString()).toBe(doctor._id.toString());
    });

    test("should reject invalid doctor ID", async () => {
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

      const req = {
        doctor: { _id: "507f1f77bcf86cd799439011" }, // Invalid doctor ID
        body: {
          parentId: parent._id,
          session_number: 1,
          session_date: "2024-12-25",
          statusOfSession: "coming",
          comments: ["Initial session"],
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionServices.createSession(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("no doctor");
    });
  });

  describe("getAllSessions", () => {
    test("should return all sessions with pagination", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Jones" });
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

      // Create 3 test sessions
      await Session.create({
        doctorId: doctor._id,
        parentId: parent._id,
        session_number: 1,
        session_date: "2024-12-25",
        statusOfSession: "done",
        comments: ["Session 1"],
      });

      await Session.create({
        doctorId: doctor._id,
        parentId: parent._id,
        session_number: 2,
        session_date: "2024-12-26",
        statusOfSession: "coming",
        comments: ["Session 2"],
      });

      await Session.create({
        doctorId: doctor._id,
        parentId: parent._id,
        session_number: 3,
        session_date: "2024-12-27",
        statusOfSession: "progress",
        comments: ["Session 3"],
      });

      const req = {
        query: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionServices.getAllSessions(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.results).toBe(3);
      expect(response.data).toHaveLength(3);
    });
  });

  describe("getSpecificSession", () => {
    test("should return specific session by ID", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Williams" });
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
        statusOfSession: "done",
        comments: ["Test session"],
      });

      const req = {
        params: { id: session._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionServices.getSpecificSession(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.session_number).toBe(1);
    });
  });

  describe("updateSpecificSession", () => {
    test("should update session data", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Brown" });
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
        comments: ["Initial session"],
      });

      const req = {
        params: { id: session._id.toString() },
        body: {
          statusOfSession: "done",
          comments: ["Updated session"],
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionServices.updateSpecificSession(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedSession = await Session.findById(session._id);
      expect(updatedSession.statusOfSession).toBe("done");
    });
  });

  describe("deleteSpecificSession", () => {
    test("should delete session", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Davis" });
      const parentData = await createParent({ userName: "Parent Six" });

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
        comments: ["To be deleted"],
      });

      const req = {
        params: { id: session._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionServices.deleteSpecificSession(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const deletedSession = await Session.findById(session._id);
      expect(deletedSession).toBeNull();
    });
  });

  describe("getAllSessionForSpecificParent", () => {
    test("should return all sessions for authenticated parent", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Taylor" });
      const parentData = await createParent({ userName: "Parent Seven" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      // Create sessions for this parent
      await Session.create({
        doctorId: doctor._id,
        parentId: parent._id,
        session_number: 1,
        session_date: "2024-12-25",
        statusOfSession: "done",
        comments: ["Session 1"],
      });

      await Session.create({
        doctorId: doctor._id,
        parentId: parent._id,
        session_number: 2,
        session_date: "2024-12-26",
        statusOfSession: "coming",
        comments: ["Session 2"],
      });

      const req = {
        parent: { _id: parent._id },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionServices.getAllSessionForSpecificParent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data).toHaveLength(2);
    });
  });

  describe("getAllSessionsForDoctor", () => {
    test("should return all sessions for authenticated doctor", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Anderson" });
      const parentData = await createParent({ userName: "Parent Eight" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      // Create sessions for this doctor
      await Session.create({
        doctorId: doctor._id,
        parentId: parent._id,
        session_number: 1,
        session_date: "2024-12-25",
        statusOfSession: "done",
        comments: ["Session 1"],
      });

      await Session.create({
        doctorId: doctor._id,
        parentId: parent._id,
        session_number: 2,
        session_date: "2024-12-26",
        statusOfSession: "progress",
        comments: ["Session 2"],
      });

      const req = {
        doctor: { _id: doctor._id },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionServices.getAllSessionsForDoctor(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data).toHaveLength(2);
    });
  });

  describe("addCommentToSpecificSession", () => {
    test("should add comment to session", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Wilson" });
      const parentData = await createParent({ userName: "Parent Nine" });

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
        statusOfSession: "progress",
        comments: ["Initial comment"],
      });

      const req = {
        params: { sessionId: session._id.toString() },
        body: {
          comment: "Follow-up comment from doctor",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionServices.addCommentToSpecificSession(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedSession = await Session.findById(session._id);
      expect(updatedSession.comments).toHaveLength(2);
      expect(updatedSession.comments[1]).toBe("Follow-up comment from doctor");
    });

    test("should reject invalid session ID", async () => {
      const req = {
        params: { sessionId: "507f1f77bcf86cd799439011" }, // Invalid session ID
        body: {
          comment: "This should fail",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionServices.addCommentToSpecificSession(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("no Session");
      expect(error).toBeDefined();
    });
  });
});
