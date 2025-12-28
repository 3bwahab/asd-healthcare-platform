/**
 * Unit Tests for orderServices
 * Tests payment processing functionality with Stripe integration
 */

const stripe = require("stripe");
const orderServices = require("../../../services/orderServices");
const Order = require("../../../models/orderModel");
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

// Mock Stripe
jest.mock("stripe", () => {
  const mockStripe = {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    customers: {
      create: jest.fn(),
    },
    ephemeralKeys: {
      create: jest.fn(),
    },
    paymentIntents: {
      create: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  };
  return jest.fn(() => mockStripe);
});

describe("orderServices", () => {
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

  describe("createSessionCashOrder", () => {
    test("should create cash order for session", async () => {
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
        parent: { _id: parent._id },
        body: {
          doctor: doctor._id,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await orderServices.createSessionCashOrder(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.price).toBe(doctor.Session_price);
      expect(response.data.parent.toString()).toBe(parent._id.toString());
      expect(response.data.doctor.toString()).toBe(doctor._id.toString());
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
        parent: { _id: parent._id },
        body: {
          doctor: "507f1f77bcf86cd799439011", // Invalid doctor ID
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await orderServices.createSessionCashOrder(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("no doctor");
    });
  });

  describe("updateSessionToPaid", () => {
    test("should mark order as paid", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Johnson" });
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

      const order = await Order.create({
        parent: parent._id,
        doctor: doctor._id,
        price: doctor.Session_price,
        isPaid: false,
      });

      const req = {
        params: { id: order._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await orderServices.updateSessionToPaid(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedOrder = await Order.findById(order._id);
      expect(updatedOrder.isPaid).toBe(true);
      expect(updatedOrder.paidAt).toBeDefined();
    });

    test("should reject invalid order ID", async () => {
      const req = {
        params: { id: "507f1f77bcf86cd799439011" }, // Invalid order ID
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await orderServices.updateSessionToPaid(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("no order");
      expect(error.statusCode).toBe(404);
    });
  });

  describe("checkoutSession", () => {
    test("should create Stripe checkout session", async () => {
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

      const mockSession = {
        id: "cs_test_123",
        url: "https://checkout.stripe.com/test",
      };

      stripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const req = {
        parent: { _id: parent._id, userName: parent.userName, email: parent.email },
        params: { doctorId: doctor._id.toString() },
        protocol: "https",
        get: jest.fn().mockReturnValue("localhost:8000"),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await orderServices.checkoutSession(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.session).toBeDefined();
      expect(response.session.id).toBe("cs_test_123");
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: "payment",
          customer_email: parent.email,
          client_reference_id: doctor._id.toString(),
        })
      );
    });

    test("should reject invalid doctor ID", async () => {
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

      const req = {
        parent: { _id: parent._id, userName: parent.userName, email: parent.email },
        params: { doctorId: "507f1f77bcf86cd799439011" },
        protocol: "https",
        get: jest.fn().mockReturnValue("localhost:8000"),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await orderServices.checkoutSession(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("no doctor");
    });
  });

  describe("paymentSheet", () => {
    test("should create mobile payment sheet", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Brown" });
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

      stripe.customers.create.mockResolvedValue({ id: "cus_test_123" });
      stripe.ephemeralKeys.create.mockResolvedValue({ secret: "ek_test_secret" });
      stripe.paymentIntents.create.mockResolvedValue({
        client_secret: "pi_test_secret",
      });

      const req = {
        parent: { _id: parent._id },
        params: { doctorId: doctor._id.toString() },
      };
      const res = {
        json: jest.fn(),
      };
      const next = jest.fn();

      await orderServices.paymentSheet(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.paymentIntent).toBe("pi_test_secret");
      expect(response.ephemeralKey).toBe("ek_test_secret");
      expect(response.customer).toBe("cus_test_123");
    });
  });
});
