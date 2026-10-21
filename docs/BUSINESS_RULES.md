# KisanKhata Core Business Rules & Validation Invariants

## 1. Identity & Access Invariants
1. **Role Immutability:** Public self-registration permits only `Role.FARMER` (via `/auth/register`) and `Role.BUYER` (via `/auth/register-buyer`). Public registration of `Role.ADMIN` is strictly forbidden.
2. **Admin Bootstrapping:** The primary administrator is provisioned exclusively on server initialization using `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` (min 12 characters).
3. **Session Expiry:** Inactivity timeout is enforced at 30 minutes (`FR-AUTH-04`, `FR-ADM-02`).
4. **Brute Force Protection:** 5 consecutive failed login attempts for any email address within a 10-minute window results in a 10-minute temporary lockout (`FR-AUTH-06`).
5. **Account Deactivation:** Deactivated users (`active = false`) are prohibited from authenticating (`FR-ADM-08`), returning "Account is disabled. Contact admin". Historical records and audit logs are permanently retained.

## 2. Farm Management Rules
1. **Cross-Tenant Isolation:** Every farmer query and mutation MUST verify `farmerId == SecurityContext.currentUser.id`. Access to records belonging to another farmer returns HTTP 404 or HTTP 403 (`FR-AUTH-05`).
2. **Expense Ownership Guard:** An expense can only reference a crop owned by the same farmer (`FR-EXP-01`). Referencing another farmer's crop ID is rejected.
3. **Crop Deletion Restriction:** A crop that has associated expense records cannot be deleted (`FR-CROP-04`, `A-09`). The system returns: `"This crop has expenses. Delete those expenses first."`.
4. **Duplicate Crop Check:** A farmer cannot register two crops with the identical name (case-insensitive) and plantation date (`FR-CROP-05`).
5. **Server-Side Wage Calculation:** Worker wages are calculated deterministically on the server:
   $$\text{paymentAmount} = \text{daysWorked} \times \text{dailyWage}$$
   Client-supplied calculated totals are strictly ignored (`FR-WRK-05`, `A-05`).
6. **Temporal Rules:**
   - Crop plantation date cannot be null.
   - Expense date and farm operation dates cannot be in the future (`FR-EXP-01`, `FR-WTR-01`, `FR-PST-01`).
   - Reminder date and time must be strictly in the future when scheduled (`FR-REM-01`).

## 3. Marketplace & Order Management Rules
1. **Single Seller Model:** Only the Admin manages product listings, prices, inventory, and activation (`A-01`).
2. **Cart Stock Validation:** Items added to cart cannot exceed current stock (`FR-MART-04`, `FR-MART-05`).
3. **Atomic Checkout:** Checkout must be executed within an atomic database transaction:
   - Validates buyer delivery information.
   - Checks inventory for all items simultaneously.
   - Decrements product `stock_quantity`.
   - Generates a unique sequential bill number (e.g. `BILL-20261021-0001`).
   - Copies snapshot of product name and unit price into `order_items` (`A-10`).
   - Clears buyer's cart items.
4. **Anti-Overselling Invariant:** Stock must never drop below zero under concurrent purchases (`NFR-08`).
5. **Manual UPI Payment Workflow:**
   - Order creation sets state `PENDING_PAYMENT`.
   - Buyer clicking "I have paid" transitions state to `PAYMENT_REPORTED`. This does NOT constitute proof of payment (`FR-MART-08`, `DEC-004`).
   - Only the Admin can verify payment in their external banking/UPI application and transition status to `PAID` (`FR-ADM-10`).
   - Cancellation by Buyer (while Pending) or Admin transitions status to `CANCELLED` and atomically restores inventory stock (`FR-MART-11`, `FR-ADM-10`).
6. **Soft Deletion of Products:** Deleting a product sets `active = false` (`A-10`). It is removed from the public mart but preserved for past order bills.

## 4. Audit & Compliance Rules
1. Every status transition of an order (`PAID`, `CANCELLED`), change to UPI payment settings, user deactivation, and product modification is recorded in `audit_logs` with admin username, IP, and timestamp (`Section 18`).
2. Audit records are immutable and read-only.
