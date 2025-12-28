/**
 * Unit Tests for reviewServices
 * Tests doctor review functionality with rating calculations
 */

const reviewServices = require("../../../services/reviewServices");
const Review = require("../../../models/reviewModel");
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

describe("reviewServices", () => {
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

  describe("createReview", () => {
    test("should create review for doctor", async () => {
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
          title: "Excellent service!",
          ratings: 5,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await reviewServices.createReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.ratings).toBe(5);
      expect(response.data.title).toBe("Excellent service!");
      expect(response.data.parent.toString()).toBe(parent._id.toString());
      expect(response.data.doctor.toString()).toBe(doctor._id.toString());
    });

    test("should calculate average rating after creating review", async () => {
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

      const req = {
        parent: { _id: parent._id },
        body: {
          doctor: doctor._id,
          title: "Good experience",
          ratings: 4,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await reviewServices.createReview(req, res, next);

      // Wait for post-save hook to update doctor ratings
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      const updatedDoctor = await Doctor.findById(doctor._id);
      expect(updatedDoctor.ratingsAverage).toBe(4);
      expect(updatedDoctor.ratingQuantity).toBe(1);
    });
  });

  describe("getAllReviews", () => {
    test("should return all reviews with pagination", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Williams" });
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

      // Create 3 test reviews
      await Review.create({
        parent: parent._id,
        doctor: doctor._id,
        title: "Review 1",
        ratings: 5,
        date: Date.now(),
      });

      await Review.create({
        parent: parent._id,
        doctor: doctor._id,
        title: "Review 2",
        ratings: 4,
        date: Date.now(),
      });

      await Review.create({
        parent: parent._id,
        doctor: doctor._id,
        title: "Review 3",
        ratings: 3,
        date: Date.now(),
      });

      const req = {
        query: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await reviewServices.getAllReviews(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.results).toBe(3);
      expect(response.data).toHaveLength(3);
    });
  });

  describe("getSpecificReviews", () => {
    test("should return specific review by ID", async () => {
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

      const review = await Review.create({
        parent: parent._id,
        doctor: doctor._id,
        title: "Great doctor!",
        ratings: 5,
        date: Date.now(),
      });

      const req = {
        params: { id: review._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await reviewServices.getSpecificReviews(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.title).toBe("Great doctor!");
      expect(response.data.ratings).toBe(5);
    });
  });

  describe("updateSpecificReviews", () => {
    test("should update review data", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Davis" });
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

      const review = await Review.create({
        parent: parent._id,
        doctor: doctor._id,
        title: "Original review",
        ratings: 4,
        date: Date.now(),
      });

      const req = {
        params: { id: review._id.toString() },
        body: {
          title: "Updated review",
          ratings: 5,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await reviewServices.updateSpecificReviews(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedReview = await Review.findById(review._id);
      expect(updatedReview.title).toBe("Updated review");
      expect(updatedReview.ratings).toBe(5);
    });
  });

  describe("deleteSpecificReviews", () => {
    test("should delete review", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Taylor" });
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

      const review = await Review.create({
        parent: parent._id,
        doctor: doctor._id,
        title: "To be deleted",
        ratings: 3,
        date: Date.now(),
      });

      const req = {
        params: { id: review._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await reviewServices.deleteSpecificReviews(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const deletedReview = await Review.findById(review._id);
      expect(deletedReview).toBeNull();
    });

    test("should recalculate doctor ratings after deleting review", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Anderson" });
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

      // Create two reviews
      const review1 = await Review.create({
        parent: parent._id,
        doctor: doctor._id,
        title: "Review 1",
        ratings: 5,
        date: Date.now(),
      });

      await Review.create({
        parent: parent._id,
        doctor: doctor._id,
        title: "Review 2",
        ratings: 3,
        date: Date.now(),
      });

      // Wait for ratings to be calculated
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      let updatedDoctor = await Doctor.findById(doctor._id);
      expect(updatedDoctor.ratingsAverage).toBe(4); // (5+3)/2 = 4
      expect(updatedDoctor.ratingQuantity).toBe(2);

      // Delete one review
      const req = {
        params: { id: review1._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await reviewServices.deleteSpecificReviews(req, res, next);

      // Wait for recalculation
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      updatedDoctor = await Doctor.findById(doctor._id);
      expect(updatedDoctor.ratingsAverage).toBe(3); // Only one review left with rating 3
      expect(updatedDoctor.ratingQuantity).toBe(1);
    });
  });

  describe("setDoctorIdToBody", () => {
    test("should set doctor ID from params to body", () => {
      const req = {
        params: { doctorId: "507f1f77bcf86cd799439011" },
        parent: { _id: "507f1f77bcf86cd799439012" },
        body: {},
      };
      const res = {};
      const next = jest.fn();

      reviewServices.setDoctorIdToBody(req, res, next);

      expect(req.body.doctor).toBe("507f1f77bcf86cd799439011");
      expect(req.body.parent.toString()).toBe("507f1f77bcf86cd799439012");
      expect(next).toHaveBeenCalled();
    });
  });

  describe("createFilterObj", () => {
    test("should create filter object from doctor ID", () => {
      const req = {
        params: { doctorId: "507f1f77bcf86cd799439011" },
      };
      const res = {};
      const next = jest.fn();

      reviewServices.createFilterObj(req, res, next);

      expect(req.filterObj).toEqual({ doctor: "507f1f77bcf86cd799439011" });
      expect(next).toHaveBeenCalled();
    });

    test("should create empty filter when no doctor ID", () => {
      const req = {
        params: {},
      };
      const res = {};
      const next = jest.fn();

      reviewServices.createFilterObj(req, res, next);

      expect(req.filterObj).toEqual({});
      expect(next).toHaveBeenCalled();
    });
  });
});
