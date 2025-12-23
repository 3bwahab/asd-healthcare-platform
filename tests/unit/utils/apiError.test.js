/**
 * Unit Tests for ApiError Utility
 * Tests custom API error class functionality
 */

const ApiError = require("../../../utils/apiError");

describe("ApiError Utility", () => {
  describe("Constructor", () => {
    test("should create an error with message and statusCode", () => {
      const message = "Resource not found";
      const statusCode = 404;

      const error = new ApiError(message, statusCode);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
    });

    test("should set status to 'fail' for 4xx errors", () => {
      const error400 = new ApiError("Bad request", 400);
      const error404 = new ApiError("Not found", 404);
      const error422 = new ApiError("Validation error", 422);

      expect(error400.status).toBe("fail");
      expect(error404.status).toBe("fail");
      expect(error422.status).toBe("fail");
    });

    test("should set status to 'error' for 5xx errors", () => {
      const error500 = new ApiError("Internal server error", 500);
      const error503 = new ApiError("Service unavailable", 503);

      expect(error500.status).toBe("error");
      expect(error503.status).toBe("error");
    });

    test("should set isOperational to true", () => {
      const error = new ApiError("Test error", 400);

      expect(error.isOperational).toBe(true);
    });

    test("should capture stack trace", () => {
      const error = new ApiError("Test error", 500);

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
      expect(error.stack).toContain("ApiError");
    });
  });

  describe("Common Error Codes", () => {
    test("should handle 400 Bad Request", () => {
      const error = new ApiError("Invalid input", 400);

      expect(error.statusCode).toBe(400);
      expect(error.status).toBe("fail");
      expect(error.message).toBe("Invalid input");
    });

    test("should handle 401 Unauthorized", () => {
      const error = new ApiError("Authentication required", 401);

      expect(error.statusCode).toBe(401);
      expect(error.status).toBe("fail");
    });

    test("should handle 403 Forbidden", () => {
      const error = new ApiError("Access denied", 403);

      expect(error.statusCode).toBe(403);
      expect(error.status).toBe("fail");
    });

    test("should handle 404 Not Found", () => {
      const error = new ApiError("Resource not found", 404);

      expect(error.statusCode).toBe(404);
      expect(error.status).toBe("fail");
    });

    test("should handle 500 Internal Server Error", () => {
      const error = new ApiError("Something went wrong", 500);

      expect(error.statusCode).toBe(500);
      expect(error.status).toBe("error");
    });
  });

  describe("Error Inheritance", () => {
    test("should be throwable", () => {
      expect(() => {
        throw new ApiError("Test error", 400);
      }).toThrow(ApiError);

      expect(() => {
        throw new ApiError("Test error", 400);
      }).toThrow("Test error");
    });

    test("should be catchable", () => {
      try {
        throw new ApiError("Caught error", 404);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.message).toBe("Caught error");
        expect(error.statusCode).toBe(404);
      }
    });

    test("should maintain Error properties", () => {
      const error = new ApiError("Test", 500);

      expect(error.name).toBe("Error");
      expect(error.message).toBe("Test");
      expect(typeof error.toString()).toBe("string");
    });
  });

  describe("Edge Cases", () => {
    test("should handle status code as string", () => {
      // @ts-ignore - Testing edge case
      const error = new ApiError("Test", "404");

      expect(error.statusCode).toBe("404");
      expect(error.status).toBe("fail");
    });

    test("should handle empty message", () => {
      const error = new ApiError("", 400);

      expect(error.message).toBe("");
      expect(error.statusCode).toBe(400);
    });

    test("should handle very long message", () => {
      const longMessage = "A".repeat(1000);
      const error = new ApiError(longMessage, 500);

      expect(error.message).toBe(longMessage);
      expect(error.message.length).toBe(1000);
    });
  });
});
