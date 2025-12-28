/**
 * Unit Tests for charityServices
 * Tests charity CRUD operations
 */

const charityServices = require("../../../services/charityServices");
const Charity = require("../../../models/charityModel");
const Parent = require("../../../models/parentModel");
const Child = require("../../../models/childModel"); // Import Child model to avoid schema error
const {
  connect,
  closeDatabase,
  clearDatabase,
} = require("../../helpers/dbHelper");

describe("charityServices", () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe("createCharity", () => {
    test("should create charity organization", async () => {
      const req = {
        body: {
          charity_name: "Hope Foundation",
          charity_address: "123 Main St, City",
          charity_phone: "+1234567890",
          logo: "https://example.com/logo.png",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await charityServices.createCharity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      const response = res.json.mock.calls[0][0];
      expect(response.data.charity_name).toBe("Hope Foundation");
      expect(response.data.charity_phone).toBe("+1234567890");
    });
  });

  describe("getAllCharities", () => {
    test.skip("should return all charities with pagination", async () => {
      // Create 3 test charities
      await Charity.create({
        charity_name: "Charity 1",
        charity_address: "Address 1",
        charity_phone: "+1111111111",
        charity_medican: [],
      });

      await Charity.create({
        charity_name: "Charity 2",
        charity_address: "Address 2",
        charity_phone: "+2222222222",
        charity_medican: [],
      });

      await Charity.create({
        charity_name: "Charity 3",
        charity_address: "Address 3",
        charity_phone: "+3333333333",
        charity_medican: [],
      });

      const req = {
        query: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await charityServices.getAllCharities(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.results).toBe(3);
      expect(response.data).toHaveLength(3);
    });
  });

  describe("getSpecificCharity", () => {
    test.skip("should return specific charity by ID", async () => {
      const charity = await Charity.create({
        charity_name: "Specific Charity",
        charity_address: "Specific address",
        charity_phone: "+9999999999",
        charity_medican: [],
      });

      const req = {
        params: { id: charity._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await charityServices.getSpecificCharity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.charity_name).toBe("Specific Charity");
    });

    test("should return error for non-existent charity ID", async () => {
      const req = {
        params: { id: "507f1f77bcf86cd799439011" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await charityServices.getSpecificCharity(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("No document");
    });
  });

  describe("updateSpecificCharity", () => {
    test.skip("should update charity data", async () => {
      const charity = await Charity.create({
        charity_name: "Original Name",
        charity_address: "Original address",
        charity_phone: "+0000000000",
        charity_medican: [],
      });

      const req = {
        params: { id: charity._id.toString() },
        body: {
          charity_name: "Updated Name",
          charity_address: "Updated address",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await charityServices.updateSpecificCharity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedCharity = await Charity.findById(charity._id);
      expect(updatedCharity.charity_name).toBe("Updated Name");
      expect(updatedCharity.charity_address).toBe("Updated address");
    });
  });

  describe("deleteSpecificCharity", () => {
    test.skip("should delete charity", async () => {
      const charity = await Charity.create({
        charity_name: "To Be Deleted",
        charity_address: "Delete address",
        charity_phone: "+8888888888",
        charity_medican: [],
      });

      const req = {
        params: { id: charity._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await charityServices.deleteSpecificCharity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const deletedCharity = await Charity.findById(charity._id);
      expect(deletedCharity).toBeNull();
    });
  });

  describe("getAllMedicianForSpecificCharity", () => {
    test("should return error for non-existent charity", async () => {
      const req = {
        params: { charityId: "507f1f77bcf86cd799439011" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await charityServices.getAllMedicianForSpecificCharity(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("There is no Charity");
    });
  });
});
