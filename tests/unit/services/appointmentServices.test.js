/**
 * Unit Tests for appointmentServices
 * Tests appointment management functionality
 */

const appointmentServices = require("../../../services/appointmentServices");
const Appointment = require("../../../models/appointmentModel");
const Doctor = require("../../../models/doctorModel");
const Parent = require("../../../models/parentModel");
const Child = require("../../../models/childModel");
const {
  connect,
  closeDatabase,
  clearDatabase,
} = require("../../helpers/dbHelper");
const {
  createParent,
  createDoctor,
} = require("../../factories/userFactory");

describe("appointmentServices", () => {
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
      speciailization: doctorData.specialization, // Note: typo in schema
      qualifications: doctorData.certification || "Board Certified",
      medicalLicense: "test-license-12345.pdf",
      Session_price: doctorData.consultationFee || 500,
    });

    return { doctor, parent: parentRecord };
  };

  describe("createAppointment", () => {
    test("should create appointment slots for doctor", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Smith" });

      const req = {
        doctor: { _id: doctor._id },
        body: {
          availableSlots: [
            { date: "2025-01-15", day: "Monday", time: "10:00 AM" },
            { date: "2025-01-15", day: "Monday", time: "11:00 AM" },
          ],
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await appointmentServices.createAppointment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();

      const response = res.json.mock.calls[0][0];
      expect(response.appointments).toHaveLength(2);
      expect(response.appointments[0].status).toBe("available");
    });

    test("should reject duplicate time slots", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Johnson" });

      // Create existing appointment
      await Appointment.create({
        doctorId: doctor._id,
        date: "2025-01-15",
        day: "Monday",
        time: "10:00 AM",
      });

      const req = {
        doctor: { _id: doctor._id },
        body: {
          availableSlots: [
            { date: "2025-01-15", day: "Monday", time: "10:00 AM" }, // Duplicate
          ],
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await appointmentServices.createAppointment(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("already exists");
    });
  });

  describe("getDoctorAppointments", () => {
    test("should get all booked appointments for doctor", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Brown" });

      // Create booked and available appointments
      await Appointment.create({
        doctorId: doctor._id,
        date: "2025-01-15",
        day: "Monday",
        time: "10:00 AM",
        status: "booked",
      });

      await Appointment.create({
        doctorId: doctor._id,
        date: "2025-01-16",
        day: "Tuesday",
        time: "2:00 PM",
        status: "available",
      });

      const req = {
        body: { doctorId: doctor._id },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await appointmentServices.getDoctorAppointments(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.appointment).toHaveLength(1);
      expect(response.appointment[0].status).toBe("booked");
    });
  });

  describe.skip("getAvailableAppointments", () => {
    test("should get available appointments for specific doctor", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Williams" });

      // Create mix of available and booked appointments
      await Appointment.create({
        doctorId: doctor._id,
        date: "2025-01-15",
        day: "Monday",
        time: "10:00 AM",
        status: "available",
      });

      await Appointment.create({
        doctorId: doctor._id,
        date: "2025-01-15",
        day: "Monday",
        time: "11:00 AM",
        status: "booked",
      });

      const req = {
        params: { doctorId: doctor._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await appointmentServices.getAvailableAppointments(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data).toHaveLength(1);
      expect(response.data[0].status).toBe("available");
    });
  });

  describe.skip("updateAppointment", () => {
    test("should update appointment time slot", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Taylor" });

      const appointment = await Appointment.create({
        doctorId: doctor._id,
        date: "2025-01-15",
        day: "Monday",
        time: "10:00 AM",
        status: "available",
      });

      const req = {
        body: {
          appointmentId: appointment._id,
          date: "2025-01-16",
          day: "Tuesday",
          time: "2:00 PM",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await appointmentServices.updateAppointment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedAppointment = await Appointment.findById(appointment._id);
      expect(updatedAppointment.date).toBe("2025-01-16");
      expect(updatedAppointment.time).toBe("2:00 PM");
    });
  });

  describe.skip("deleteAppointment", () => {
    test("should delete available appointment slot", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Davis" });

      const appointment = await Appointment.create({
        doctorId: doctor._id,
        date: "2025-01-15",
        day: "Monday",
        time: "10:00 AM",
        status: "available",
      });

      const req = {
        params: { id: appointment._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await appointmentServices.deleteAppointment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const deletedAppointment = await Appointment.findById(appointment._id);
      expect(deletedAppointment).toBeNull();
    });

    test("should prevent deleting booked appointment", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Miller" });

      const appointment = await Appointment.create({
        doctorId: doctor._id,
        date: "2025-01-15",
        day: "Monday",
        time: "10:00 AM",
        status: "booked",
      });

      const req = {
        params: { id: appointment._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await appointmentServices.deleteAppointment(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toContain("cannot delete");
    });
  });

  describe.skip("bookAppointment", () => {
    test("should book available appointment", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Wilson" });
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

      const child = await Child.create({
        childName: "Child One",
        childAge: 5,
        childGender: "male",
        diagnosis: "ASD Level 1",
        medicalHistory: "Test history",
        parentId: parent._id,
      });

      const appointment = await Appointment.create({
        doctorId: doctor._id,
        date: "2025-01-15",
        day: "Monday",
        time: "10:00 AM",
        status: "available",
      });

      const req = {
        params: { id: appointment._id.toString() },
        body: {
          parentId: parent._id.toString(),
          childId: child._id.toString(),
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await appointmentServices.bookAppointment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const bookedAppointment = await Appointment.findById(appointment._id);
      expect(bookedAppointment.status).toBe("booked");
      expect(bookedAppointment.parentId.toString()).toBe(parent._id.toString());
      expect(bookedAppointment.childId.toString()).toBe(child._id.toString());
    });
  });

  describe.skip("cancelAppointment", () => {
    test("should cancel booked appointment", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Garcia" });
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

      const child = await Child.create({
        childName: "Child Two",
        childAge: 6,
        childGender: "female",
        diagnosis: "ASD Level 2",
        medicalHistory: "Test history",
        parentId: parent._id,
      });

      const appointment = await Appointment.create({
        doctorId: doctor._id,
        parentId: parent._id,
        childId: child._id,
        date: "2025-01-15",
        day: "Monday",
        time: "10:00 AM",
        status: "booked",
      });

      const req = {
        params: { id: appointment._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await appointmentServices.cancelAppointment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const cancelledAppointment = await Appointment.findById(appointment._id);
      expect(cancelledAppointment.status).toBe("cancelled");
    });
  });

  describe.skip("confirmAppointment", () => {
    test("should confirm booked appointment", async () => {
      const { doctor } = await createTestDoctor({ userName: "Dr. Martinez" });
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

      const child = await Child.create({
        childName: "Child Three",
        childAge: 7,
        childGender: "male",
        diagnosis: "ASD Level 1",
        medicalHistory: "Test history",
        parentId: parent._id,
      });

      const appointment = await Appointment.create({
        doctorId: doctor._id,
        parentId: parent._id,
        childId: child._id,
        date: "2025-01-15",
        day: "Monday",
        time: "10:00 AM",
        status: "booked",
      });

      const req = {
        params: { id: appointment._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await appointmentServices.confirmAppointment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      const confirmedAppointment = await Appointment.findById(appointment._id);
      expect(confirmedAppointment.status).toBe("confirmed");
    });
  });
});
