# KisanKhata Automated Testing Strategy & Test Suites

## 1. Test Architecture & Tooling
- **Framework:** JUnit 5 (Jupiter), Spring Boot Test, Spring Security Test, AssertJ, MockMvc.
- **Database:** In-memory / transient H2 database instance for isolation between test runs.
- **Transactions:** `@Transactional` test methods roll back automatically to maintain test hygiene.

## 2. Test Pyramid & Coverage Requirements

### Unit Tests (`src/test/java/in/kisankhata/.../service`)
1. **Worker Wage Calculation:** Verify `daysWorked * dailyWage` correctly computes `paymentAmount` with various decimal precisions.
2. **Duplicate Crop Detection:** Test case-insensitive name matching and date equality.
3. **Password Security:** Verify BCrypt hashing produces salted, unrecoverable hashes.
4. **Login Throttling:** Validate that 5 failed attempts locks the account for 10 minutes.
5. **Report Calculations:** Validate date-range sums, crop sums, and grand totals.

### Security & Multi-Tenant Authorization Tests
1. **Tenant Isolation (Farmer A vs. Farmer B):**
   - Farmer A creates Crop A.
   - Farmer B attempts `GET /api/v1/farmer/crops/{cropA.id}` -> Expect `404 Not Found`.
   - Farmer B attempts `DELETE /api/v1/farmer/crops/{cropA.id}` -> Expect `404 Not Found`.
   - Farmer B attempts `POST /api/v1/farmer/expenses` referencing Crop A -> Expect `404 Not Found` or `400 Bad Request`.
2. **Buyer Isolation:**
   - Buyer A cannot view Buyer B's cart or order bill.
3. **Admin Privilege Isolation:**
   - Admin cannot access `/api/v1/farmer/**` endpoints.
   - Non-admin (Farmer or Buyer) cannot access `/api/v1/admin/**` endpoints -> Expect `403 Forbidden`.
4. **Public Access:**
   - Visitor cannot access `/api/v1/farmer/**` without session -> Expect `401 Unauthorized`.

### Marketplace & Concurrency Tests
1. **Stock Reduction:** Verify order placement atomically reduces product stock.
2. **Concurrency / Race Condition:** Simulate two simultaneous orders for the last remaining item. Exactly one succeeds; the second receives an out-of-stock error; stock quantity remains 0 (never negative).
3. **Order Cancellation:** Verify buyer cancelling Pending order or admin cancelling restores stock quantity.
4. **Manual UPI Workflow:** Verify buyer "I have paid" sets status to `PAYMENT_REPORTED`, and only Admin can transition status to `PAID`.

### API Integration Tests (MockMvc)
1. Farmer registration with duplicate email -> `409 Conflict`.
2. Add expense with invalid/missing crop -> `400 Bad Request`.
3. Delete crop with active expenses -> `409 Conflict`.
4. Reminder with past timestamp -> `400 Bad Request`.
5. Health check `/actuator/health` -> `200 OK` with `UP`.

## 3. Running Test Suites
```bash
# Run entire test suite
mvn test

# Run specific test class
mvn test -Dtest=TenantIsolationSecurityTests

# Run package tests
mvn clean test -Dtest=in.kisankhata.farm.*
```
