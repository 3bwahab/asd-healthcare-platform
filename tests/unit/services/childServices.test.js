/**
 * Unit Tests for childServices
 * Tests child management operations
 */

const childServices = require("../../../services/childServices");
const Child = require("../../../models/childModel");
const Parent = require("../../../models/parentModel");
const {
  connect,
  closeDatabase,
  clearDatabase,
} = require("../../helpers/dbHelper");
const { createParent } = require("../../factories/userFactory");

describe("childServices", () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe("createChild", () => {
    test("should create child for authenticated parent", async () => {
      const parentData = await createParent({ userName: "Test Parent" });

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
          childName: "Test Child",
          birthday: new Date("2018-01-15"),
          gender: "male",
          age: 7,
          healthDetails: "Healthy child",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await childServices.createChild(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      const response = res.json.mock.calls[0][0];
      expect(response.data.childName).toBe("Test Child");
      expect(response.data.parent.toString()).toBe(parent._id.toString());
    });

    test("should reject child creation for non-existent parent", async () => {
      const req = {
        parent: { _id: "507f1f77bcf86cd799439011" }, // Invalid parent ID
        body: {
          childName: "Orphan Child",
          birthday: new Date("2018-01-15"),
          gender: "female",
          age: 7,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await childServices.createChild(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("no parent");
      expect(error.statusCode).toBe(404);
    });
  });

  describe("getAllChilds", () => {
    test("should return all children", async () => {
      const parentData = await createParent({ userName: "Parent With Kids" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      // Create 2 children
      await Child.create({
        parent: parent._id,
        childName: "Child One",
        birthday: new Date("2018-01-15"),
        age: 7,
        gender: "male",
      });

      await Child.create({
        parent: parent._id,
        childName: "Child Two",
        birthday: new Date("2019-03-20"),
        age: 6,
        gender: "female",
      });

      const req = {
        query: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await childServices.getAllChilds(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.results).toBe(2);
      expect(response.data).toHaveLength(2);
    });
  });

  describe("getSpecificChild", () => {
    test("should return specific child by ID", async () => {
      const parentData = await createParent({ userName: "Single Parent" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const child = await Child.create({
        parent: parent._id,
        childName: "Specific Child",
        birthday: new Date("2017-05-10"),
        age: 8,
        gender: "male",
      });

      const req = {
        params: { id: child._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await childServices.getSpecificChild(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.childName).toBe("Specific Child");
      expect(response.data.age).toBe(8);
    });

    test("should return error for non-existent child ID", async () => {
      const req = {
        params: { id: "507f1f77bcf86cd799439011" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await childServices.getSpecificChild(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("No document");
    });
  });

  describe("updateSpecificChild", () => {
    test("should update child data", async () => {
      const parentData = await createParent({ userName: "Update Parent" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const child = await Child.create({
        parent: parent._id,
        childName: "Old Name",
        birthday: new Date("2018-01-15"),
        age: 7,
        gender: "male",
      });

      const req = {
        params: { id: child._id.toString() },
        body: {
          childName: "Updated Name",
          age: 8,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await childServices.updateSpecificChild(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedChild = await Child.findById(child._id);
      expect(updatedChild.childName).toBe("Updated Name");
      expect(updatedChild.age).toBe(8);
    });
  });

  describe("deleteSpecificChild", () => {
    test("should delete specific child", async () => {
      const parentData = await createParent({ userName: "Delete Parent" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const child = await Child.create({
        parent: parent._id,
        childName: "Delete Me",
        birthday: new Date("2018-01-15"),
        age: 7,
        gender: "female",
      });

      const req = {
        params: { id: child._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await childServices.deleteSpecificChild(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const deletedChild = await Child.findById(child._id);
      expect(deletedChild).toBeNull();
    });
  });

  describe("deleteAllChild", () => {
    test("should delete all children for authenticated parent", async () => {
      const parentData = await createParent({ userName: "Delete All Parent" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      // Create 3 children for this parent
      await Child.create({
        parent: parent._id,
        childName: "Child One",
        birthday: new Date("2018-01-15"),
        age: 7,
        gender: "male",
      });

      await Child.create({
        parent: parent._id,
        childName: "Child Two",
        birthday: new Date("2019-03-20"),
        age: 6,
        gender: "female",
      });

      await Child.create({
        parent: parent._id,
        childName: "Child Three",
        birthday: new Date("2020-05-10"),
        age: 5,
        gender: "male",
      });

      const req = {
        parent: { _id: parent._id },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await childServices.deleteAllChild(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.deletedCount).toBe(3);

      const remainingChildren = await Child.find({ parent: parent._id });
      expect(remainingChildren).toHaveLength(0);
    });
  });
});
