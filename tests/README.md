# Testing Infrastructure

This directory contains comprehensive test suites for the ASD Healthcare Management Platform API.

## 📁 Directory Structure

```
tests/
├── unit/                      - Unit tests for individual modules
│   ├── utils/                 - Utility function tests
│   ├── models/                - Model validation tests (planned)
│   ├── middleware/            - Middleware tests (planned)
│   └── services/              - Service layer tests (planned)
│
├── integration/               - Integration tests for API endpoints
│   ├── health.test.js         - Health check endpoint tests
│   ├── auth.test.js           - Authentication flow tests (planned)
│   └── users.test.js          - User management tests (planned)
│
├── e2e/                       - End-to-end tests (planned)
│   └── userJourney.test.js    - Complete user workflows (planned)
│
├── helpers/                   - Test helper utilities
│   ├── dbHelper.js            - Database setup/teardown
│   ├── authHelper.js          - Authentication helpers
│   └── mockHelper.js          - External service mocking
│
├── factories/                 - Test data factories
│   ├── userFactory.js         - User test data generation
│   ├── appointmentFactory.js  - Appointment test data
│   └── sessionFactory.js      - Session test data
│
├── setup.js                   - Jest global setup
├── teardown.js                - Jest global teardown
└── README.md                  - This file
```

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run E2E Tests Only
```bash
npm run test:e2e
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

## 🎯 Coverage Targets

Our testing infrastructure enforces the following coverage thresholds:

### Global Coverage (All Files)
- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

### Service Layer Coverage
- **Branches:** 80%
- **Functions:** 80%
- **Lines:** 80%
- **Statements:** 80%

*Higher coverage is required for the service layer as it contains critical business logic.*

## 🧪 Test Categories

### Unit Tests
Unit tests focus on testing individual functions, methods, and classes in isolation.

**Examples:**
- ✅ `apiError.test.js` - Custom error class (11 test cases)
- ✅ `createToken.test.js` - JWT token generation (10 test cases)
- ✅ `apiFeatures.test.js` - Query features (8 test cases)

**Total Unit Tests:** 29+ test cases

### Integration Tests
Integration tests verify that different parts of the application work together correctly.

**Examples:**
- ✅ `health.test.js` - Health check endpoints (7 test cases)
- 🔜 `auth.test.js` - Authentication flow (planned)
- 🔜 `users.test.js` - User CRUD operations (planned)

### E2E Tests
End-to-end tests simulate real user workflows from start to finish.

**Examples:**
- 🔜 `userJourney.test.js` - Complete user workflows (planned)

## 🛠️ Test Utilities

### Database Helper (`dbHelper.js`)
```javascript
const { connect, closeDatabase, clearDatabase } = require('./helpers/dbHelper');

beforeAll(async () => {
  await connect(); // Connect to in-memory MongoDB
});

afterEach(async () => {
  await clearDatabase(); // Clear data between tests
});

afterAll(async () => {
  await closeDatabase(); // Close connection after all tests
});
```

### Authentication Helper (`authHelper.js`)
```javascript
const { generateToken, createTestParent } = require('./helpers/authHelper');

// Generate JWT token for testing
const token = generateToken(userId);

// Create test parent user data
const parentData = createTestParent();
```

### Mock Helper (`mockHelper.js`)
```javascript
const { mockFastAPIGetQuestion, clearAllMocks } = require('./helpers/mockHelper');

// Mock FastAPI endpoint
mockFastAPIGetQuestion(1);

// Clear all mocks after test
afterEach(() => {
  clearAllMocks();
});
```

### Test Factories
```javascript
const { createParent, createDoctor } = require('./factories/userFactory');
const { createAppointment } = require('./factories/appointmentFactory');

// Generate realistic test data
const parent = await createParent();
const doctor = await createDoctor();
const appointment = createAppointment(parent._id, doctor._id, child._id);
```

## 🔧 Configuration

### Jest Configuration (`jest.config.js`)
- **Test Environment:** Node.js
- **Coverage Reporters:** text, lcov, html, json-summary
- **Test Timeout:** 30 seconds
- **Max Workers:** 50% (parallel execution)
- **Setup File:** `tests/setup.js`
- **Teardown File:** `tests/teardown.js`

### Mocked Services

The following external services are automatically mocked in tests:

1. **Cloudinary** - Image uploads
2. **Nodemailer** - Email sending
3. **Stripe** - Payment processing
4. **FastAPI** - AI/ML endpoints (via nock)

This ensures tests run quickly and don't depend on external services.

## 📊 Test Reports

### Coverage Reports
After running tests with coverage, reports are generated in:
- **HTML Report:** `coverage/index.html` (open in browser)
- **LCOV Report:** `coverage/lcov.info` (for CI tools)
- **JSON Report:** `coverage/coverage-final.json`
- **Console Summary:** Displayed after test run

### Viewing Coverage Report
```bash
# Run tests with coverage
npm test

# Open HTML report (Windows)
start coverage/index.html

# Open HTML report (Mac/Linux)
open coverage/index.html
```

## ✍️ Writing Tests

### Test File Naming
- Unit tests: `*.test.js` in `tests/unit/`
- Integration tests: `*.test.js` in `tests/integration/`
- E2E tests: `*.test.js` in `tests/e2e/`

### Test Structure
```javascript
describe('Feature Name', () => {
  beforeAll(() => {
    // Runs once before all tests in this suite
  });

  beforeEach(() => {
    // Runs before each test
  });

  afterEach(() => {
    // Runs after each test
  });

  afterAll(() => {
    // Runs once after all tests in this suite
  });

  describe('Specific Functionality', () => {
    test('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe('expected');
    });

    test('should handle edge cases', () => {
      expect(() => {
        functionUnderTest(null);
      }).toThrow();
    });
  });
});
```

### Best Practices

1. **Use Descriptive Test Names**
   - Good: `should return 404 when user not found`
   - Bad: `test user not found`

2. **Follow AAA Pattern**
   - **Arrange:** Set up test data
   - **Act:** Execute the function/endpoint
   - **Assert:** Verify the result

3. **Test One Thing Per Test**
   - Each test should verify a single behavior
   - Makes failures easier to diagnose

4. **Use Test Factories**
   - Generate realistic test data with factories
   - Avoid hardcoding test values

5. **Clean Up After Tests**
   - Clear database after each test
   - Clear mocks with `clearAllMocks()`

6. **Mock External Dependencies**
   - Mock all external API calls
   - Mock file uploads, emails, payments

## 🐛 Debugging Tests

### Run Specific Test File
```bash
npm test tests/unit/utils/apiError.test.js
```

### Run Specific Test Suite
```bash
npm test -- --testNamePattern="ApiError Utility"
```

### Enable Verbose Output
```bash
npm test -- --verbose
```

### Debug with Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Faker.js Documentation](https://fakerjs.dev/)
- [Nock Documentation](https://github.com/nock/nock)

## 🎯 Current Status

### Completed ✅
- Jest configuration with coverage thresholds
- Test utilities and helpers (database, auth, mocking)
- Test data factories (users, appointments, sessions)
- Unit tests for utilities (29+ test cases)
- Integration tests for health endpoints (7 test cases)

### Planned 🔜
- Unit tests for models
- Unit tests for middleware
- Unit tests for services
- Integration tests for authentication flow
- Integration tests for CRUD operations
- Integration tests for payment processing
- E2E tests for user journeys

## 💡 Tips

- Run tests before committing code
- Write tests alongside new features (TDD)
- Keep test coverage above 70%
- Use `test.only()` to run single tests during development
- Use `test.skip()` to temporarily skip failing tests
- Check coverage report to find untested code

---

**Happy Testing! 🧪**
