/**
 * Unit Tests for educationServices
 * Tests educational article CRUD operations
 */

const educationServices = require("../../../services/educationServices");
const Education = require("../../../models/educationModel");
const Parent = require("../../../models/parentModel");
const Child = require("../../../models/childModel"); // Import Child model to avoid schema error
const {
  connect,
  closeDatabase,
  clearDatabase,
} = require("../../helpers/dbHelper");
const { createParent } = require("../../factories/userFactory");

describe("educationServices", () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe("createArticle", () => {
    test("should create educational article", async () => {
      const parentData = await createParent({ userName: "Author One" });

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
          title: "Understanding Autism Spectrum Disorder",
          info: "Comprehensive guide to ASD symptoms and treatment options",
          image: "https://example.com/image.jpg",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await educationServices.createArticle(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.title).toBe("Understanding Autism Spectrum Disorder");
      expect(response.data.creator.toString()).toBe(parent._id.toString());
    });

    test("should reject invalid parent ID", async () => {
      const req = {
        parent: { _id: "507f1f77bcf86cd799439011" }, // Invalid parent ID
        body: {
          title: "Test Article",
          info: "Test content",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await educationServices.createArticle(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("must belong to valid Parent");
    });
  });

  describe("getAllArticles", () => {
    test("should return all articles with pagination", async () => {
      const parentData = await createParent({ userName: "Author Two" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      // Create 3 test articles
      await Education.create({
        title: "Article 1",
        info: "Info 1",
        creator: parent._id,
        image: "https://example.com/1.jpg",
      });

      await Education.create({
        title: "Article 2",
        info: "Info 2",
        creator: parent._id,
        image: "https://example.com/2.jpg",
      });

      await Education.create({
        title: "Article 3",
        info: "Info 3",
        creator: parent._id,
        image: "https://example.com/3.jpg",
      });

      const req = {
        query: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await educationServices.getAllArticles(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.results).toBe(3);
      expect(response.data).toHaveLength(3);
    });
  });

  describe("getSpecificArticle", () => {
    test("should return specific article by ID", async () => {
      const parentData = await createParent({ userName: "Author Three" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const article = await Education.create({
        title: "Specific Article",
        info: "Detailed information",
        creator: parent._id,
        image: "https://example.com/specific.jpg",
      });

      const req = {
        params: { id: article._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await educationServices.getSpecificArticle(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.title).toBe("Specific Article");
    });

    test("should return error for non-existent article ID", async () => {
      const req = {
        params: { id: "507f1f77bcf86cd799439011" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await educationServices.getSpecificArticle(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("No document");
    });
  });

  describe("updateSpecificArticle", () => {
    test("should update article data", async () => {
      const parentData = await createParent({ userName: "Author Four" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const article = await Education.create({
        title: "Original Title",
        info: "Original info",
        creator: parent._id,
        image: "https://example.com/original.jpg",
      });

      const req = {
        params: { id: article._id.toString() },
        body: {
          title: "Updated Title",
          info: "Updated information",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await educationServices.updateSpecificArticle(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedArticle = await Education.findById(article._id);
      expect(updatedArticle.title).toBe("Updated Title");
      expect(updatedArticle.info).toBe("Updated information");
    });
  });

  describe("deleteSpecificArticle", () => {
    test("should delete article", async () => {
      const parentData = await createParent({ userName: "Author Five" });

      const parent = await Parent.create({
        userName: parentData.userName,
        email: parentData.email,
        phone: parentData.phone,
        password: "TestPass123!",
        age: parentData.age,
        address: parentData.address,
        emailResetVerfied: true,
      });

      const article = await Education.create({
        title: "To Be Deleted",
        info: "This will be deleted",
        creator: parent._id,
        image: "https://example.com/delete.jpg",
      });

      const req = {
        params: { id: article._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await educationServices.deleteSpecificArticle(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const deletedArticle = await Education.findById(article._id);
      expect(deletedArticle).toBeNull();
    });
  });
});
