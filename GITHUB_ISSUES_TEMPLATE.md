# GitHub Issues to Create

Create these 3 issues at: https://github.com/3bwahab/asd-healthcare-platform/issues/new

---

## Issue #1: Add OpenAPI/Swagger Documentation

**Title**: `docs: Add interactive API documentation with Swagger UI`

**Labels**: `enhancement`, `documentation`, `good first issue`

**Description**:

```markdown
## 📚 Problem
The API currently lacks interactive documentation. Developers need to manually read `API_EXAMPLES.md` and test endpoints with curl/Postman. This creates a barrier for new contributors and API consumers.

## 💡 Proposed Solution
Implement OpenAPI 3.0 specification with Swagger UI to provide:
- Interactive API exploration at `/api-docs`
- Automatic request/response validation
- Try-it-out functionality for all endpoints
- Auto-generated from existing JSDoc comments

## 🎯 Implementation Steps
1. Install dependencies: `swagger-ui-express`, `swagger-jsdoc`
2. Create `/config/swagger.js` with OpenAPI base configuration
3. Add JSDoc annotations to routes following OpenAPI 3.0 spec
4. Mount Swagger UI at `/api-docs` endpoint
5. Update README.md with Swagger documentation link

## 📝 Example JSDoc Format
\`\`\`javascript
/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register new parent user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userName, email, password]
 *             properties:
 *               userName:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *     responses:
 *       201:
 *         description: User created successfully
 */
\`\`\`

## ✅ Acceptance Criteria
- [ ] Swagger UI accessible at `/api-docs`
- [ ] All public endpoints documented
- [ ] Request/response schemas defined
- [ ] Authentication documented (JWT bearer token)
- [ ] Examples provided for each endpoint
- [ ] README updated with documentation link

## 📚 References
- [swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express)
- [swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
```

---

## Issue #2: Implement Comprehensive Audit Logging Middleware

**Title**: `feat: Add audit logging for security-critical operations`

**Labels**: `enhancement`, `security`, `logging`

**Description**:

```markdown
## 🔒 Security Gap
The application currently lacks audit trails for critical operations (user actions, appointment changes, payment processing, data deletion). This creates compliance and security risks for a healthcare platform handling sensitive patient data.

## 💡 Proposed Solution
Implement audit logging middleware that tracks:
- Authentication attempts (login/logout/failed attempts)
- Appointment lifecycle (create/book/cancel/confirm)
- Payment transactions (create order, webhook events)
- Profile modifications (parent/doctor/child updates)
- Data deletion operations

## 🎯 Implementation Plan

### 1. Create Audit Log Model
**File**: `/models/auditLogModel.js`

\`\`\`javascript
const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Parent',
    required: true
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
           'BOOK_APPOINTMENT', 'CANCEL_APPOINTMENT', 'PAYMENT'],
    required: true
  },
  resource: {
    type: String,
    enum: ['appointment', 'order', 'parent', 'doctor', 'child', 'session', 'auth'],
    required: true
  },
  resourceId: mongoose.Schema.ObjectId,
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success'
  },
  errorMessage: String
}, { timestamps: true });

// Indexes for query performance
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
\`\`\`

### 2. Create Audit Middleware
**File**: `/middleware/auditMiddleware.js`

\`\`\`javascript
const AuditLog = require('../models/auditLogModel');

const auditLog = async (req, action, resource, resourceId, changes = null) => {
  try {
    await AuditLog.create({
      userId: req.user?._id || req.parent?._id || req.doctor?._id,
      action,
      resource,
      resourceId,
      changes,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't fail the request if audit logging fails
  }
};

module.exports = auditLog;
\`\`\`

### 3. Apply to Critical Routes

**Authentication Events**:
\`\`\`javascript
// In authServices.js
await auditLog(req, 'LOGIN', 'auth', parent._id);
await auditLog(req, 'LOGIN_FAILED', 'auth', null);
\`\`\`

**Appointment Changes**:
\`\`\`javascript
// In appointmentServices.js
await auditLog(req, 'BOOK_APPOINTMENT', 'appointment', appointment._id, {
  before: { status: 'available' },
  after: { status: 'booked', parentId, childId }
});
\`\`\`

**Payment Events**:
\`\`\`javascript
// In orderServices.js
await auditLog(req, 'PAYMENT', 'order', order._id, {
  amount: session.amount_total / 100,
  paymentMethod: 'card'
});
\`\`\`

### 4. Admin Endpoint to View Logs
**File**: `/routes/auditRoutes.js`

\`\`\`javascript
// GET /api/v1/audit?userId=...&action=...&startDate=...&endDate=...
router.get('/',
  protectForAdmin,
  allowedTo('admin'),
  getAuditLogs
);
\`\`\`

## ✅ Acceptance Criteria
- [ ] AuditLog model created with proper schema
- [ ] Middleware logs authentication events
- [ ] Middleware logs appointment changes
- [ ] Middleware logs payment events
- [ ] Middleware logs profile updates
- [ ] Admin endpoint to view audit logs with filtering
- [ ] Proper indexing on userId, resource, timestamp
- [ ] Tests for audit logging middleware
- [ ] Documentation updated

## 🔐 Benefits
- **Compliance**: Meet healthcare data regulations (HIPAA-like requirements)
- **Security**: Investigate security incidents and unauthorized access attempts
- **Analytics**: Understand user behavior patterns
- **Debugging**: Trace issues in production environment
- **Accountability**: Track who did what and when

## 📊 Example Audit Log Query
\`\`\`javascript
// Get all failed login attempts in last 24 hours
AuditLog.find({
  action: 'LOGIN_FAILED',
  createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
}).sort({ createdAt: -1 });

// Get all actions by specific user
AuditLog.find({ userId: '...' })
  .sort({ createdAt: -1 })
  .limit(50);
\`\`\`
```

---

## Issue #3: Standardize API Response Format Across All Endpoints

**Title**: `refactor: Standardize API response structure for consistency`

**Labels**: `refactor`, `api`, `breaking-change`

**Description**:

```markdown
## 🔧 Problem
API responses are inconsistent across endpoints:
- Some return `{ data: ... }`
- Others return `{ message: ..., data: ... }`
- Some return `{ status: ..., data: ... }`
- Error responses vary between `{ error: ... }` and `{ message: ... }`

This inconsistency creates confusion for API consumers and makes client-side error handling difficult.

## 💡 Proposed Solution
Implement a standardized response wrapper that all endpoints use.

### Success Response Format
\`\`\`json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
\`\`\`

### Error Response Format
\`\`\`json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    }
  ]
}
\`\`\`

## 🎯 Implementation Plan

### 1. Create Response Formatter Utility
**File**: `/utils/responseFormatter.js`

\`\`\`javascript
/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {Object} pagination - Pagination metadata (optional)
 */
exports.successResponse = (res, statusCode = 200, message = 'Success', data = null, pagination = null) => {
  const response = {
    success: true,
    statusCode,
    message,
    data
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Array} errors - Validation errors (optional)
 */
exports.errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    statusCode,
    message
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
\`\`\`

### 2. Create Response Middleware
**File**: `/middleware/responseMiddleware.js`

\`\`\`javascript
const { successResponse, errorResponse } = require('../utils/responseFormatter');

module.exports = (req, res, next) => {
  // Attach helper methods to response object
  res.success = (statusCode, message, data, pagination) => {
    return successResponse(res, statusCode, message, data, pagination);
  };

  res.error = (statusCode, message, errors) => {
    return errorResponse(res, statusCode, message, errors);
  };

  next();
};
\`\`\`

### 3. Update All Service Responses

**Before**:
\`\`\`javascript
res.status(200).json({ parent, token });
\`\`\`

**After**:
\`\`\`javascript
res.success(200, 'Signup successful', { parent, token });
\`\`\`

**Before**:
\`\`\`javascript
return next(new ApiError('User not found', 404));
\`\`\`

**After**:
\`\`\`javascript
res.error(404, 'User not found');
\`\`\`

### 4. Update Error Middleware
**File**: `/middleware/errorMiddleware.js`

\`\`\`javascript
const { errorResponse } = require('../utils/responseFormatter');

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return errorResponse(res, err.statusCode, err.message, [
      { stack: err.stack }
    ]);
  }

  // Production - hide sensitive details
  return errorResponse(res, err.statusCode, err.message);
};
\`\`\`

## ✅ Acceptance Criteria
- [ ] Response formatter utility created
- [ ] All success responses follow new format
- [ ] All error responses follow new format
- [ ] Pagination metadata included where applicable
- [ ] API_EXAMPLES.md updated with new format
- [ ] Existing tests updated to match new format
- [ ] CHANGELOG.md documents breaking change
- [ ] Migration guide created for API consumers

## ⚠️ Breaking Change Notice
This is a **BREAKING CHANGE** that requires:
- Version bump to v2.0.0
- Migration guide for API consumers
- Deprecation notice period (optional - can be immediate)

## 📊 Impact Analysis
**Affected Endpoints**: ~40 endpoints across 8 route files
- `/routes/authRoutes.js` (8 endpoints)
- `/routes/parentRoutes.js` (5 endpoints)
- `/routes/doctorRoutes.js` (5 endpoints)
- `/routes/appointmentRoutes.js` (6 endpoints)
- `/routes/sessionRoutes.js` (5 endpoints)
- `/routes/orderRoutes.js` (4 endpoints)
- `/routes/reviewRoutes.js` (4 endpoints)
- `/routes/ai/aiRoutes.js` (3 endpoints)

## 🎯 Benefits
- **Consistency**: Same structure across all endpoints
- **Developer Experience**: Easier to integrate and maintain
- **Error Handling**: Predictable error format simplifies client-side error handling
- **Documentation**: Clear contract for API consumers
- **Type Safety**: Enables better TypeScript type definitions
```

---

## Instructions

1. **Create Issue #1**: Visit https://github.com/3bwahab/asd-healthcare-platform/issues/new
   - Copy title and description from above
   - Add labels: `enhancement`, `documentation`, `good first issue`

2. **Create Issue #2**: Visit https://github.com/3bwahab/asd-healthcare-platform/issues/new
   - Copy title and description from above
   - Add labels: `enhancement`, `security`, `logging`

3. **Create Issue #3**: Visit https://github.com/3bwahab/asd-healthcare-platform/issues/new
   - Copy title and description from above
   - Add labels: `refactor`, `api`, `breaking-change`

All issues are well-documented with implementation plans, code examples, and acceptance criteria.
