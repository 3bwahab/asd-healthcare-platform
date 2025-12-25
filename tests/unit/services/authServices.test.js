const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const authServices = require("../../../services/authServices");
const Parent = require("../../../models/parentModel");
const Doctor = require("../../../models/doctorModel");
const Child = require("../../../models/childModel"); // Import Child model to avoid schema error
const {
  connect,
  closeDatabase,
  clearDatabase,
} = require("../../helpers/dbHelper");
const { createParent, createDoctor } = require("../../factories/userFactory");
const sendEmail = require("../../../utils/sendEmail");

// Mock sendEmail to avoid actual email sending in tests
jest.mock("../../../utils/sendEmail");

describe("authServices", () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe("singupForParent", () => {
    test("should create parent user with hashed password", async () => {
      const parentData = await createParent({
        userName: "John Doe", // Max 20 chars to pass validation
      });
      const req = { body: parentData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Mock sendEmail to resolve successfully
      sendEmail.mockResolvedValue(true);

      await authServices.singupForParent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      const parent = await Parent.findOne({ email: parentData.email });
      expect(parent).toBeDefined();
      expect(parent.userName).toBe(parentData.userName);
      expect(parent.password).not.toBe(parentData.password); // Password should be hashed
      expect(parent.emailResetCode).toBeDefined(); // Verification code set
      expect(parent.emailResetVerfied).toBe(false); // Not verified yet
    });

    test("should send verification email", async () => {
      const parentData = await createParent({
        userName: "Jane Smith",
      });
      const req = { body: parentData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      sendEmail.mockResolvedValue(true);

      await authServices.singupForParent(req, res, next);

      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: parentData.email,
          subject: "Welcome to ASD Healthcare Platform - Verify Your Email",
          template: "emailVerification",
        })
      );
    });

    test("should reject duplicate email", async () => {
      const parentData = await createParent({
        userName: "Bob Wilson",
      });

      // Create first parent
      await Parent.create(parentData);

      // Try to create second parent with same email
      const req = { body: parentData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authServices.singupForParent(req, res, next);

      // Should call next with error (Mongoose duplicate key error)
      expect(next).toHaveBeenCalled();
    });
  });

  describe("verifyEmailResetCode", () => {
    test("should activate account with correct verification code", async () => {
      const parentData = await createParent({
        userName: "Alice Brown",
      });

      // Create parent with verification code
      const resetCode = "1234";
      const hashResetCode = crypto
        .createHash("sha256")
        .update(resetCode)
        .digest("hex");

      const parent = await Parent.create({
        ...parentData,
        emailResetCode: hashResetCode,
        emailResetExpire: Date.now() + 10 * 60 * 1000, // 10 minutes
        emailResetVerfied: false,
      });

      const req = {
        body: { resetCode },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authServices.verifyEmailResetCode(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Verify Success.." })
      );

      const updatedParent = await Parent.findById(parent._id);
      expect(updatedParent.emailResetVerfied).toBe(true);
    });

    test("should reject invalid verification code", async () => {
      const parentData = await createParent({
        userName: "Charlie Davis",
      });

      const resetCode = "1234";
      const hashResetCode = crypto
        .createHash("sha256")
        .update(resetCode)
        .digest("hex");

      await Parent.create({
        ...parentData,
        emailResetCode: hashResetCode,
        emailResetExpire: Date.now() + 10 * 60 * 1000,
        emailResetVerfied: false,
      });

      const req = {
        body: { resetCode: "9999" }, // Wrong code
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authServices.verifyEmailResetCode(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("invalid or expired");
    });
  });

  describe("login", () => {
    test("should return JWT token for valid credentials", async () => {
      const plainPassword = "TestPass123!";
      const parentData = await createParent({
        userName: "Eve Johnson",
        password: plainPassword, // Override with known plain password
      });

      // Create verified parent (password will be hashed by pre-save hook)
      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: plainPassword, // Pass plain password, let model hash it
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const req = {
        body: {
          email: parentData.email,
          password: plainPassword, // Use plain password for login
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authServices.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      const response = res.json.mock.calls[0][0];
      expect(response.token).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data.email).toBe(parentData.email);
    });

    test("should reject invalid password", async () => {
      const plainPassword = "TestPass123!";
      const parentData = await createParent({
        userName: "Frank Miller",
        password: plainPassword,
      });

      // Create verified parent
      await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: plainPassword, // Pass plain password, let model hash it
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const req = {
        body: {
          email: parentData.email,
          password: "WrongPassword123!", // Wrong password
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authServices.login(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("Incorrect Email or Password");
      expect(error.statusCode).toBe(401);
    });

    test("should reject unverified account", async () => {
      const plainPassword = "TestPass123!";
      const parentData = await createParent({
        userName: "Grace Lee",
        password: plainPassword,
      });

      // Create unverified parent
      await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: plainPassword, // Pass plain password, let model hash it
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: false, // Not verified
      });

      const req = {
        body: {
          email: parentData.email,
          password: plainPassword,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authServices.login(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("not verified your account");
      expect(error.statusCode).toBe(403);
    });
  });
});
