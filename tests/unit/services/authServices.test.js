const crypto = require("crypto");
// const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const authServices = require("../../../services/authServices");
const Parent = require("../../../models/parentModel");
const Doctor = require("../../../models/doctorModel");
// const Child = require("../../../models/childModel"); // Import Child model to avoid schema error
const {
  connect,
  closeDatabase,
  clearDatabase,
} = require("../../helpers/dbHelper");
const { createParent } = require("../../factories/userFactory");
// const { createDoctor } = require("../../factories/userFactory");
const sendEmail = require("../../../utils/sendEmail");
const createToken = require("../../../utils/createToken");

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

  describe("resendEmailResetCode", () => {
    test("should resend verification code to unverified user", async () => {
      const parentData = await createParent({
        userName: "Helen Clark",
      });

      // Create unverified parent
      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: false,
      });

      const req = {
        parent: { email: parent.email }, // Authenticated request
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      sendEmail.mockResolvedValue(true);
      await authServices.resendEmailResetCode(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });

    test("should resend code even for already verified account", async () => {
      // Service doesn't check if account is already verified - it just resends code
      const parentData = await createParent({
        userName: "Ian Brown",
      });

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
        parent: { email: parent.email },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authServices.resendEmailResetCode(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      // Verify code was set and emailResetVerfied set back to false
      const updatedParent = await Parent.findById(parent._id);
      expect(updatedParent.emailResetCode).toBeDefined();
      expect(updatedParent.emailResetVerfied).toBe(false);
    });
  });

  describe("forgotPassword", () => {
    test("should send password reset code to valid email", async () => {
      const plainPassword = "TestPass123!";
      const parentData = await createParent({
        userName: "Jack Wilson",
        password: plainPassword,
      });

      // Create verified parent
      await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: plainPassword,
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const req = { body: { email: parentData.email } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      sendEmail.mockResolvedValue(true);
      await authServices.forgotPassword(req, res, next);

      // forgotPassword calls next() not res.status() - it's middleware
      expect(next).toHaveBeenCalledWith();
      expect(sendEmail).toHaveBeenCalledTimes(1);

      // Wait for save operation (service has missing await on parent.save())
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      // Verify reset code was set in database
      const parent = await Parent.findOne({ email: parentData.email });
      expect(parent.passwordResetCode).toBeDefined();
      expect(parent.passwordResetExpire).toBeDefined();
      expect(parent.passwordResetVerfied).toBe(false);
    });

    test("should reject non-existent email", async () => {
      const req = { body: { email: "nonexistent@example.com" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authServices.forgotPassword(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("no user for this email");
      expect(error.statusCode).toBe(404);
    });
  });

  describe("verifyPasswordResetCode", () => {
    test("should verify valid password reset code", async () => {
      const plainPassword = "TestPass123!";
      const parentData = await createParent({
        userName: "Kate Davis",
        password: plainPassword,
      });

      // Create parent with reset code
      const resetCode = "1234";
      const hashResetCode = crypto
        .createHash("sha256")
        .update(resetCode)
        .digest("hex");

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: plainPassword,
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
        passwordResetCode: hashResetCode,
        passwordResetExpire: Date.now() + 10 * 60 * 1000,
        passwordResetVerfied: false,
      });

      const req = { body: { resetCode } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authServices.verifyPasswordResetCode(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      // Verify code was marked as verified
      const updatedParent = await Parent.findById(parent._id);
      expect(updatedParent.passwordResetVerfied).toBe(true);
    });

    test("should reject invalid reset code", async () => {
      const plainPassword = "TestPass123!";
      const parentData = await createParent({
        userName: "Leo Martinez",
        password: plainPassword,
      });

      const resetCode = "1234";
      const hashResetCode = crypto
        .createHash("sha256")
        .update(resetCode)
        .digest("hex");

      await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: plainPassword,
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
        passwordResetCode: hashResetCode,
        passwordResetExpire: Date.now() + 10 * 60 * 1000,
        passwordResetVerfied: false,
      });

      const req = { body: { resetCode: "9999" } }; // Wrong code
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authServices.verifyPasswordResetCode(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("invalid or expired");
    });
  });

  describe("resetPasseword", () => {
    test("should reset password with valid code", async () => {
      const oldPassword = "OldPass123!";
      const newPassword = "NewPass123!";
      const parentData = await createParent({
        userName: "Mia Anderson",
        password: oldPassword,
      });

      const resetCode = "1234";
      const hashResetCode = crypto
        .createHash("sha256")
        .update(resetCode)
        .digest("hex");

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: oldPassword,
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
        passwordResetCode: hashResetCode,
        passwordResetExpire: Date.now() + 10 * 60 * 1000,
        passwordResetVerfied: true, // Must be verified first
      });

      const req = { body: { newPassword, confirmPassword: newPassword } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authServices.resetPasseword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      // Verify password was changed
      const updatedParent = await Parent.findById(parent._id);
      const passwordMatch = await bcrypt.compare(
        newPassword,
        updatedParent.password
      );
      expect(passwordMatch).toBe(true);

      // Verify reset fields were cleared
      expect(updatedParent.passwordResetCode).toBeUndefined();
      expect(updatedParent.passwordResetExpire).toBeUndefined();
      expect(updatedParent.passwordResetVerfied).toBeUndefined();
    });

    test("should reject reset without verified code", async () => {
      const plainPassword = "TestPass123!";
      const parentData = await createParent({
        userName: "Nina Lopez",
        password: plainPassword,
      });

      await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: plainPassword,
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
        passwordResetVerfied: false, // Not verified
      });

      const req = {
        body: {
          newPassword: "NewPass123!",
          confirmPassword: "NewPass123!",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authServices.resetPasseword(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("not verified");
    });
  });

  describe("protectForParent", () => {
    test("should authenticate valid JWT token", async () => {
      const plainPassword = "TestPass123!";
      const parentData = await createParent({
        userName: "Oscar Green",
        password: plainPassword,
      });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: plainPassword,
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const token = createToken(parent._id);

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = {};
      const next = jest.fn();

      await authServices.protectForParent(req, res, next);

      expect(next).toHaveBeenCalledWith(); // Called with no error
      expect(req.parent).toBeDefined();
      expect(req.parent.email).toBe(parentData.email);
    });

    test("should reject missing token", async () => {
      const req = { headers: {} };
      const res = {};
      const next = jest.fn();

      await authServices.protectForParent(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("not login");
      expect(error.statusCode).toBe(401);
    });

    test("should reject invalid token", async () => {
      const req = {
        headers: {
          authorization: "Bearer invalid-token-123",
        },
      };
      const res = {};
      const next = jest.fn();

      // JWT verification will throw an error that asyncHandler catches
      await authServices.protectForParent(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      // JWT throws JsonWebTokenError with message "jwt malformed"
      expect(error).toBeDefined();
    });
  });

  describe("singupForDoctor", () => {
    test("should create doctor user with medical license", async () => {
      // First create a parent user (doctors must signup as parent first)
      const plainPassword = "TestPass123!";
      const parentData = await createParent({
        userName: "Dr. Paul White",
        password: plainPassword,
      });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: plainPassword,
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
        role: "parent", // Will be upgraded to "doctor"
      });

      const req = {
        parent: { _id: parent._id }, // Authenticated parent
        body: {
          speciailization: "Autism Specialist", // Note: typo in schema
          qualifications: "Board Certified Psychiatrist",
          medicalLicense: "https://cloudinary.com/license.pdf",
          address: "123 Medical Plaza",
          Session_price: 500,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authServices.singupForDoctor(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      const response = res.json.mock.calls[0][0];
      expect(response.data).toBeDefined();
      expect(response.token).toBeDefined();

      // Verify doctor was created
      const doctor = await Doctor.findById(response.data._id);
      expect(doctor.speciailization).toBe("Autism Specialist");
      expect(doctor.Session_price).toBe(500);

      // Verify parent role was upgraded
      const updatedParent = await Parent.findById(parent._id);
      expect(updatedParent.role).toBe("doctor");
    });
  });
});
