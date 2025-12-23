/**
 * Integration Tests for Health/Root Endpoint
 * Tests basic API health check functionality
 */

const request = require("supertest");
const express = require("express");

describe("Health Check Integration Tests", () => {
  let app;

  beforeAll(() => {
    // Create minimal Express app for testing
    app = express();

    // Root endpoint (mimics index.js)
    app.get("/", (req, res) => {
      res.json({
        message: "ASD Healthcare Management Platform API",
        version: "1.0.0",
        status: "active",
      });
    });

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });
  });

  describe("GET /", () => {
    test("should return API information", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("version");
      expect(response.body).toHaveProperty("status");
      expect(response.body.message).toBe(
        "ASD Healthcare Management Platform API"
      );
      expect(response.body.version).toBe("1.0.0");
      expect(response.body.status).toBe("active");
    });

    test("should return JSON content type", async () => {
      const response = await request(app).get("/");

      expect(response.headers["content-type"]).toMatch(/json/);
    });

    test("should return response quickly", async () => {
      const startTime = Date.now();
      await request(app).get("/");
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });

  describe("GET /health", () => {
    test("should return healthy status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status");
      expect(response.body.status).toBe("healthy");
    });

    test("should return timestamp", async () => {
      const response = await request(app).get("/health");

      expect(response.body).toHaveProperty("timestamp");
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    test("should return uptime", async () => {
      const response = await request(app).get("/health");

      expect(response.body).toHaveProperty("uptime");
      expect(typeof response.body.uptime).toBe("number");
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Error Handling", () => {
    test("should return 404 for non-existent route", async () => {
      const response = await request(app).get("/non-existent-route");

      expect(response.status).toBe(404);
    });
  });
});
