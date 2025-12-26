# Test Coverage Roadmap: 10% → 70%

**Current Status:** ✅ Phase 1 Complete (10.22% coverage)
**Target:** 70% global coverage, 80% services coverage
**Timeline:** Progressive improvement over 2 weeks

---

## 📊 Current Metrics (Phase 1 Complete)

```
Global Coverage:    10.22% / 70% target (14.6% complete)
Services Coverage:   5.68% / 80% target (7.1% complete)
Tests:              61 passing, 12 skipped, 0 failing
Total Test Suites:  5 suites
```

### Coverage Breakdown by Category

| Category | Current | Target | Status |
|----------|---------|--------|--------|
| **Utils** | 71.76% | 70% | ✅ **DONE** |
| **Models** | 37.39% | 60% | 🟡 62% complete |
| **Services** | 5.68% | 80% | 🔴 7% complete |
| **Middleware** | 0% | 70% | 🔴 Not started |
| **Routes** | 0% | 50% | 🔴 Not started |

---

## 🎯 Phase 2 Goal: Reach 30% Coverage

**Strategy:** Focus on high-impact services with complex business logic

### Priority 1: Core Services (Target: +15% coverage)

#### 1. appointmentServices.js (16 functions, ~445 lines)
**Impact:** Critical booking logic, prevents double-booking bugs

**Tests to Write:**
```javascript
// tests/unit/services/appointmentServices.test.js

describe("appointmentServices", () => {
  // Doctor creates available slots
  test("createAppointment - creates time slots");
  test("createAppointment - prevents duplicate slots");

  // Parents book appointments
  test("bookAppointment - books available slot");
  test("bookAppointment - rejects already booked");
  test("bookAppointment - validates parent/child/doctor IDs");

  // Manage appointments
  test("getAvailableAppointments - filters by status");
  test("cancelAppointment - cancels booking");
  test("confirmAppointment - doctor confirms");
  test("deleteAppointment - deletes available only");
});
```

**Known Issue to Fix:**
- `createDoctor()` factory missing `age` field for Parent model
- **Solution:** Add `age: faker.number.int({ min: 25, max: 65 })` to userFactory.js

**Estimated Tests:** 12 tests
**Coverage Gain:** ~6%

---

#### 2. orderServices.js (10 functions, ~257 lines)
**Impact:** Payment processing, revenue-critical functionality

**Tests to Write:**
```javascript
// tests/unit/services/orderServices.test.js

describe("orderServices", () => {
  // Stripe integration (mock stripe API)
  test("checkoutSession - creates Stripe session");
  test("paymentSheet - creates mobile payment intent");
  test("webhookCheckout - processes Stripe webhook");

  // Order management
  test("createSessionCashOrder - creates cash order");
  test("updateSessionToPaid - marks order paid");
  test("updateSessionToPaid - sends receipt email");

  // Order retrieval
  test("getAllOrders - gets all orders with pagination");
  test("getSpecificOrder - gets single order");
  test("getParentOrders - filters by parent");
});
```

**Mock Strategy:**
```javascript
jest.mock('stripe', () => ({
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' })
    }
  }
}));
```

**Estimated Tests:** 10 tests
**Coverage Gain:** ~5%

---

#### 3. parentServices.js + childServices.js (CRUD operations)
**Impact:** User management, data integrity

**Tests to Write:**
```javascript
// tests/unit/services/parentServices.test.js

describe("parentServices", () => {
  test("getAll - returns paginated parents");
  test("getAll - filters by search keyword");
  test("getOne - returns parent with populated children");
  test("updateOne - updates parent fields");
  test("updateOne - prevents email conflicts");
  test("deleteOne - soft deletes parent");
  test("updatePassword - hashes new password");
  test("getProfile - returns current user");
});

// tests/unit/services/childServices.test.js

describe("childServices", () => {
  test("createChild - creates child for parent");
  test("createChild - validates parent ownership");
  test("getAll - returns all children for parent");
  test("updateChild - updates child details");
  test("deleteChild - removes child");
});
```

**Estimated Tests:** 13 tests
**Coverage Gain:** ~4%

---

### Phase 2 Total Estimate
- **Tests Added:** ~35 tests
- **Coverage Gain:** ~15%
- **New Coverage:** 25-30%

---

## 🚀 Phase 3 Goal: Reach 50% Coverage

### Priority 2: Remaining Services + Integration Tests

#### 4. sessionServices.js (Session management)
- Create sessions from appointments
- Add therapist notes and recommendations
- Track session completion
- **Est:** 8 tests, +3% coverage

#### 5. reviewServices.js + sessionReviewServices.js (Feedback system)
- Create/update reviews
- Calculate average ratings
- Validate review permissions
- **Est:** 10 tests, +2% coverage

#### 6. Integration Tests (E2E user journeys)
```javascript
// tests/integration/userJourney.test.js

describe("Parent User Journey", () => {
  test("Complete appointment booking flow", async () => {
    // Signup → Verify → Login → Add Child →
    // Browse Doctors → Book → Pay → Receive Confirmation
  });
});

describe("Doctor Journey", () => {
  test("Manage availability and appointments", async () => {
    // Login → Create Slots → View Bookings →
    // Confirm → Conduct Session → Add Notes
  });
});
```

**Estimated Tests:** 20 integration tests
**Coverage Gain:** ~10%

---

## 🎓 Phase 4: Reach 70% Coverage

### Priority 3: Middleware, Validators, Edge Cases

#### 7. Middleware Tests
```javascript
// tests/unit/middleware/errorMiddleware.test.js
describe("Error Middleware", () => {
  test("sends detailed errors in development");
  test("sends limited errors in production");
  test("handles operational vs programming errors");
});

// tests/unit/middleware/validatorMiddleware.test.js
describe("Validator Middleware", () => {
  test("returns 400 for validation errors");
  test("includes field-specific error messages");
});
```

**Estimated Tests:** 10 tests
**Coverage Gain:** ~5%

---

#### 8. Validator Tests (High-value, low-effort)
```javascript
// tests/unit/validators/authValidator.test.js
describe("Auth Validators", () => {
  test("signup - validates email format");
  test("signup - validates password strength");
  test("signup - validates required fields");
  test("login - validates credentials format");
});

// Similar for: appointmentValidator, parentValidator, doctorValidator
```

**Estimated Tests:** 40 validator tests
**Coverage Gain:** ~10%

---

#### 9. Fix Skipped authServices Tests
Currently 11 tests skipped in [authServices.test.js](tests/unit/services/authServices.test.js):

**Required Fixes:**

1. **resendEmailResetCode** - Expects `req.parent.email` (authenticated user)
   - **Solution:** Mock authenticated request:
   ```javascript
   const req = {
     parent: { email: parentData.email }, // Add this
     body: { email: parentData.email }
   };
   ```

2. **forgotPassword** - Should work as-is, needs debugging
   - Read lines 414-462 in authServices.js to verify exact params

3. **verifyPasswordResetCode** - Should work, verify password reset flow

4. **resetPasseword** - Needs `newPasswordConfirm` field
   - Check line 535+ for exact required fields

5. **protectForParent** - JWT middleware test
   - Currently fails because `req.user` not set
   - Verify middleware populates req.user correctly

6. **singupForDoctor** - Needs file upload mock
   ```javascript
   const req = {
     body: doctorData,
     file: { filename: "license.pdf" } // Mock multer file object
   };
   ```

**Estimated Effort:** 2-3 hours to fix all 11 tests
**Coverage Gain:** +3-5%

---

## 📋 Quick Win Checklist

### Immediate Actions (Next Session)

- [ ] **Fix createDoctor factory** - Add `age` field
  ```javascript
  // tests/factories/userFactory.js line ~45
  age: faker.number.int({ min: 25, max: 65 }),
  ```

- [ ] **Unskip and fix 2 easiest tests:**
  - [ ] `forgotPassword` - Should work with minor tweaks
  - [ ] `verifyPasswordResetCode` - Working logic, just verify params

- [ ] **Create appointmentServices.test.js** - 6-8 core tests
  - Focus on: createAppointment, bookAppointment, getAvailableAppointments

- [ ] **Run tests and verify 15%+ coverage**

---

## 🔧 Testing Patterns Established

### ✅ Working Patterns (Use These!)

```javascript
// 1. Parent/Doctor Creation Pattern
const plainPassword = "TestPass123!";
const parentData = await createParent({
  userName: "Short Name", // Max 20 chars!
  password: plainPassword,
});

// 2. Create in DB (let pre-save hook hash password)
const parent = await Parent.create({
  userName: parentData.userName,
  email: parentData.email,
  phone: parentData.phone,
  password: plainPassword, // Plain, not hashed
  age: parentData.age,
  address: parentData.address,
  emailResetVerfied: true,
});

// 3. Mock External Services
jest.mock("../../../utils/sendEmail");
sendEmail.mockResolvedValue(true);

// 4. Test Request/Response
const req = { body: { email, password } };
const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};
const next = jest.fn();

await serviceFunction(req, res, next);

// 5. Assertions
expect(res.status).toHaveBeenCalledWith(200);
expect(res.json).toHaveBeenCalled();
const response = res.json.mock.calls[0][0];
expect(response.data).toBeDefined();
```

### ❌ Anti-Patterns (Avoid!)

```javascript
// DON'T: Use pre-hashed passwords from factory
await Parent.create({
  ...parentData, // Contains hashed password - will double-hash!
});

// DON'T: Exceed model validation limits
userName: faker.person.fullName(), // Can exceed 20 chars

// DON'T: Forget to import related models
// Missing: const Child = require("../../../models/childModel");
// Result: MissingSchemaError for virtual populate

// DON'T: Skip clearing database
afterEach(async () => {
  // await clearDatabase(); // REQUIRED!
});
```

---

## 📚 Useful Resources

### Test Files to Reference
- ✅ [authServices.test.js](tests/unit/services/authServices.test.js) - Service testing pattern
- ✅ [createToken.test.js](tests/unit/utils/createToken.test.js) - JWT testing
- ✅ [apiFeatures.test.js](tests/unit/utils/apiFeatures.test.js) - Mongoose query testing

### Factories
- [userFactory.js](tests/factories/userFactory.js) - Parent/Doctor data
- [appointmentFactory.js](tests/factories/appointmentFactory.js) - Appointment/Child data

### Helpers
- [dbHelper.js](tests/helpers/dbHelper.js) - In-memory MongoDB
- [mockHelper.js](tests/helpers/mockHelper.js) - External service mocks

---

## 🎯 Coverage Milestones

| Milestone | Coverage | Tests | Est. Time | Status |
|-----------|----------|-------|-----------|--------|
| **Phase 1** | 10% | 61 | 4 hours | ✅ Complete |
| **Phase 2** | 30% | ~95 | 6 hours | 🔲 Next |
| **Phase 3** | 50% | ~150 | 6 hours | 🔲 Planned |
| **Phase 4** | 70% | ~200 | 4 hours | 🔲 Planned |

**Total Estimated Effort:** 20 hours over 2 weeks

---

## 🚦 Success Criteria

### Phase 2 Complete When:
- [ ] Global coverage ≥ 25%
- [ ] Services coverage ≥ 15%
- [ ] All critical service tests passing
- [ ] appointmentServices: 8+ tests
- [ ] orderServices: 8+ tests
- [ ] parentServices: 6+ tests

### Final Success (70%) When:
- [ ] Global coverage ≥ 70%
- [ ] Services coverage ≥ 80%
- [ ] 0 failing tests
- [ ] CI/CD pipeline green
- [ ] MLH Fellowship review: 100% (305/305 points)

---

## 📞 Getting Help

If stuck on a specific test:
1. Check the service implementation (services/*.js)
2. Verify request parameters in route validators (utils/validator/*.js)
3. Review model schema (models/*.js) for required fields
4. Reference working tests in this file for patterns
5. Use `npm test -- <test-file> --verbose` for detailed errors

**Happy Testing! 🧪**
