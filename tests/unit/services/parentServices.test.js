/**
 * Unit Tests for parentServices
 * Tests parent user CRUD operations
 */

const parentServices = require("../../../services/parentServices");
const Parent = require("../../../models/parentModel");
const Child = require("../../../models/childModel"); // Import Child model to avoid schema error
const {
  connect,
  closeDatabase,
  clearDatabase,
} = require("../../helpers/dbHelper");
const { createParent } = require("../../factories/userFactory");

describe("parentServices", () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe("getAllParents", () => {
    test("should return all parents with pagination", async () => {
      // Create 3 test parents
      const parent1Data = await createParent({ userName: "Parent One" });
      const parent2Data = await createParent({ userName: "Parent Two" });
      const parent3Data = await createParent({ userName: "Parent Three" });

      await Parent.create({
        userName: parent1Data.userName,
        email: parent1Data.email,
        phone: parent1Data.phone,
        password: "TestPass123!",
        age: parent1Data.age,
        address: parent1Data.address,
        emailResetVerfied: true,
      });

      await Parent.create({
        userName: parent2Data.userName,
        email: parent2Data.email,
        phone: parent2Data.phone,
        password: "TestPass123!",
        age: parent2Data.age,
        address: parent2Data.address,
        emailResetVerfied: true,
      });

      await Parent.create({
        userName: parent3Data.userName,
        email: parent3Data.email,
        phone: parent3Data.phone,
        password: "TestPass123!",
        age: parent3Data.age,
        address: parent3Data.address,
        emailResetVerfied: true,
      });

      const req = {
        query: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await parentServices.getAllParents(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.results).toBe(3);
      expect(response.data).toHaveLength(3);
    });

    test("should return paginated results with limit", async () => {
      // Create 5 test parents
      for (let i = 0; i < 5; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const parentData = await createParent({ userName: `Parent ${i}` });
        // eslint-disable-next-line no-await-in-loop
        await Parent.create({
          userName: parentData.userName,
          email: parentData.email,
          phone: parentData.phone,
          password: "TestPass123!",
          age: parentData.age,
          address: parentData.address,
          emailResetVerfied: true,
        });
      }

      const req = {
        query: { limit: "2", page: "1" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await parentServices.getAllParents(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.results).toBe(2);
      expect(response.data).toHaveLength(2);
    });
  });

  describe("getSpecificParent", () => {
    test("should return specific parent by ID", async () => {
      const parentData = await createParent({ userName: "John Doe" });

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
        params: { id: parent._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await parentServices.getSpecificParent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.email).toBe(parentData.email);
      expect(response.data.userName).toBe(parentData.userName);
    });

    test("should return error for non-existent parent ID", async () => {
      const req = {
        params: { id: "507f1f77bcf86cd799439011" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await parentServices.getSpecificParent(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("No document");
    });
  });

  describe("updateParent", () => {
    test("should update parent data", async () => {
      const parentData = await createParent({ userName: "Jane Smith" });

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
        params: { id: parent._id.toString() },
        body: {
          userName: "Jane Updated",
          age: 35,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await parentServices.updateParent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedParent = await Parent.findById(parent._id);
      expect(updatedParent.userName).toBe("Jane Updated");
      expect(updatedParent.age).toBe(35);
    });
  });

  describe("deleteParent", () => {
    test("should delete parent", async () => {
      const parentData = await createParent({ userName: "Delete Me" });

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
        params: { id: parent._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await parentServices.deleteParent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const deletedParent = await Parent.findById(parent._id);
      expect(deletedParent).toBeNull();
    });
  });

  describe("changePassword", () => {
    test("should change parent password", async () => {
      const parentData = await createParent({ userName: "Password Test" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "OldPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const req = {
        params: { id: parent._id.toString() },
        body: {
          password: "NewPass123!",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await parentServices.changePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedParent = await Parent.findById(parent._id);
      expect(updatedParent.password).not.toBe("NewPass123!"); // Should be hashed
      expect(updatedParent.passwordChangedAt).toBeDefined();
    });
  });

  describe("getLoggedParentData", () => {
    test("should return logged parent data", async () => {
      const parentData = await createParent({ userName: "Logged User" });

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
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await parentServices.getLoggedParentData(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.email).toBe(parentData.email);
    });
  });

  describe("updateLoggedParentPassword", () => {
    test("should update logged parent password", async () => {
      const parentData = await createParent({ userName: "Update My Pass" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "OldPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const req = {
        parent: { _id: parent._id },
        body: {
          password: "NewSecurePass123!",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await parentServices.updateLoggedParentPassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedParent = await Parent.findById(parent._id);
      expect(updatedParent.passwordChangedAt).toBeDefined();
    });
  });
});
