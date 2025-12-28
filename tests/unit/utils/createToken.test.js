/**
 * Unit Tests for createToken Utility
 * Tests JWT token creation functionality
 */

const jwt = require("jsonwebtoken");
const createToken = require("../../../utils/createToken");

describe("createToken Utility", () => {
  const mockUserId = "65a7b3cf48f2a123456789a";

  beforeAll(() => {
    // Ensure environment variables are set
    process.env.JWT_SECRET_KEY = "test-jwt-secret-key";
    process.env.JWT_EXPIRE_TIME = "90d";
  });

  describe("Token Creation", () => {
    test("should create a valid JWT token", () => {
      const token = createToken(mockUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT has 3 parts separated by dots
    });

    test("should encode userId in token payload", () => {
      const token = createToken(mockUserId);
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      expect(decoded.userId).toBe(mockUserId);
    });

    test("should set expiration time from env variable", () => {
      const token = createToken(mockUserId);
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    test("should include issued at (iat) timestamp", () => {
      const token = createToken(mockUserId);
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      expect(decoded.iat).toBeDefined();
      expect(typeof decoded.iat).toBe("number");
      expect(decoded.iat).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
    });
  });

  describe("Token Verification", () => {
    test("should create token that can be verified", () => {
      const token = createToken(mockUserId);

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockUserId);
    });

    test("should fail verification with wrong secret", () => {
      const token = createToken(mockUserId);

      expect(() => {
        jwt.verify(token, "wrong-secret");
      }).toThrow();
    });

    test("should create unique tokens for different users", () => {
      const token1 = createToken("user-id-1");
      const token2 = createToken("user-id-2");

      expect(token1).not.toBe(token2);

      const decoded1 = jwt.verify(token1, process.env.JWT_SECRET_KEY);
      const decoded2 = jwt.verify(token2, process.env.JWT_SECRET_KEY);

      expect(decoded1.userId).not.toBe(decoded2.userId);
    });
  });

  describe("Token Payload", () => {
    test("should handle string userId", () => {
      const userId = "test-user-123";
      const token = createToken(userId);
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      expect(decoded.userId).toBe(userId);
    });

    test("should handle ObjectId-like userId", () => {
      const userId = "507f1f77bcf86cd799439011";
      const token = createToken(userId);
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      expect(decoded.userId).toBe(userId);
    });
  });

  describe("Token Expiration", () => {
    test("should calculate correct expiration for 90d", () => {
      process.env.JWT_EXPIRE_TIME = "90d";
      const token = createToken(mockUserId);
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      const expectedExpiry = decoded.iat + 90 * 24 * 60 * 60; // 90 days in seconds
      expect(decoded.exp).toBeCloseTo(expectedExpiry, -2); // Allow small difference
    });

    test("should handle different expiration times", () => {
      // Test with 1 day
      process.env.JWT_EXPIRE_TIME = "1d";
      const token1d = createToken(mockUserId);
      const decoded1d = jwt.verify(token1d, process.env.JWT_SECRET_KEY);

      // Test with 7 days
      process.env.JWT_EXPIRE_TIME = "7d";
      const token7d = createToken(mockUserId);
      const decoded7d = jwt.verify(token7d, process.env.JWT_SECRET_KEY);

      expect(decoded7d.exp).toBeGreaterThan(decoded1d.exp);

      // Reset to 90d
      process.env.JWT_EXPIRE_TIME = "90d";
    });

    test("should handle hours expiration format", () => {
      process.env.JWT_EXPIRE_TIME = "24h";
      const token = createToken(mockUserId);
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      const expectedExpiry = decoded.iat + 24 * 60 * 60; // 24 hours in seconds
      expect(decoded.exp).toBeCloseTo(expectedExpiry, -2);

      // Reset to 90d
      process.env.JWT_EXPIRE_TIME = "90d";
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty string userId", () => {
      const token = createToken("");
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      expect(decoded.userId).toBe("");
    });

    test("should handle numeric userId", () => {
      // @ts-ignore - Testing edge case
      const token = createToken(12345);
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      expect(decoded.userId).toBe(12345);
    });

    test("should create different tokens for same user at different times", async () => {
      const token1 = createToken(mockUserId);

      // Wait 1100ms to ensure different iat (JWT uses seconds, not milliseconds)
      await new Promise((resolve) => {
        setTimeout(resolve, 1100);
      });

      const token2 = createToken(mockUserId);

      // Tokens should be different due to different iat
      expect(token1).not.toBe(token2);

      const decoded1 = jwt.verify(token1, process.env.JWT_SECRET_KEY);
      const decoded2 = jwt.verify(token2, process.env.JWT_SECRET_KEY);

      expect(decoded1.userId).toBe(decoded2.userId);
      expect(decoded2.iat).toBeGreaterThanOrEqual(decoded1.iat);
    });
  });

  describe("Security", () => {
    test("should use secret key from environment", () => {
      const originalSecret = process.env.JWT_SECRET_KEY;
      process.env.JWT_SECRET_KEY = "custom-test-secret";

      const token = createToken(mockUserId);

      expect(() => {
        jwt.verify(token, originalSecret);
      }).toThrow();

      // Should verify with custom secret
      const decoded = jwt.verify(token, "custom-test-secret");
      expect(decoded.userId).toBe(mockUserId);

      // Restore original
      process.env.JWT_SECRET_KEY = originalSecret;
    });

    test("should not expose secret in token", () => {
      const token = createToken(mockUserId);

      expect(token).not.toContain(process.env.JWT_SECRET_KEY);
    });

    test("should not be tamperable", () => {
      const token = createToken(mockUserId);
      const parts = token.split(".");

      // Tamper with payload
      const tamperedToken = `${parts[0]}.${Buffer.from('{"userId":"hacker"}').toString("base64")}.${parts[2]}`;

      expect(() => {
        jwt.verify(tamperedToken, process.env.JWT_SECRET_KEY);
      }).toThrow();
    });
  });
});
