# KisanKhata Architecture Specification

## 1. High-Level Architectural Design
KisanKhata is structured as a **modular monolith** adhering strictly to domain boundaries while maintaining single-JAR deployment simplicity.

```
+-----------------------------------------------------------------------------------------+
|                                    KisanKhata Monolith                                  |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  |                            Edge & Security Layer                                  |  |
|  |  Spring Security 6 | Session Filter | CSRF Filter | CORS | Login Rate Limiter     |  |
|  +-----------------------------------------------------------------------------------+  |
|                                             |                                           |
|  +-----------------------------------------------------------------------------------+  |
|  |                             REST API Controller Layer                             |  |
|  |  /auth/* | /farmer/* | /mart/* | /admin/* | /actuator/health                          |  |
|  +-----------------------------------------------------------------------------------+  |
|                                             |                                           |
|  +-----------------------------------------------------------------------------------+  |
|  |                            Domain Services & Workflows                            |  |
|  |  AuthService | FarmService | WorkerService | MartService | OrderService | AdminService|
|  +-----------------------------------------------------------------------------------+  |
|                                             |                                           |
|  +-----------------------------------------------------------------------------------+  |
|  |                         Data Access Layer (Tenant Isolated)                       |  |
|  |  Spring Data JPA Repositories | Hibernate ORM | Transaction Management            |  |
|  +-----------------------------------------------------------------------------------+  |
|                                             |                                           |
|  +------------------------------------------+----------------------------------------+  |
|  |                                          |                                        |  |
|  v                                          v                                        v  |
| [H2 Embedded Relational DB]      [Local Disk File Storage]             [Application Logs]   |
| (./data/kisankhata.mv.db)        (./data/uploads/{products,qr})       (./logs/app.log)      |
+-----------------------------------------------------------------------------------------+
```

## 2. Package & Module Structure
The Spring Boot backend is organized under `in.kisankhata`:
- `in.kisankhata.config`: Security, Web MVC, CORS, CSRF, and bootstrap initialization.
- `in.kisankhata.common`: Centralized exception handling, standard API response DTOs, audit logging.
- `in.kisankhata.auth`: Registration, login, session inspection, logout, and rate limiting.
- `in.kisankhata.user`: User entities (`AppUser`), roles (`Role`: `FARMER`, `BUYER`, `ADMIN`), status.
- `in.kisankhata.farm`: Farm ledger domain: `Crop`, `Expense`, `Worker`, `FarmRecord` (water, fertilizer, pesticide, reminder), and financial aggregation reports.
- `in.kisankhata.marketplace`: Mart domain: `Product`, `CartItem`, `Order`, `OrderItem`, `PaymentSettings`.
- `in.kisankhata.admin`: Administrator operations: catalog moderation, order fulfillment, manual UPI verification, user deactivation, and KPIs.
- `in.kisankhata.storage`: Secure file upload validation and disk storage service.

## 3. Data Isolation Model (Multi-Tenancy)
1. **Farmer Data Isolation:**
   - Every farm entity (`Crop`, `Expense`, `Worker`, `FarmRecord`) possesses a mandatory `farmerId` foreign key.
   - All repository read, update, and delete queries must be scoped to both the entity primary key `id` AND the authenticated user's `farmerId`.
   - Never trust client-provided tenant/owner IDs. Identity is resolved exclusively from `SecurityContextHolder.getContext().getAuthentication()`.
2. **Buyer Data Isolation:**
   - Carts and orders possess a mandatory `buyerId`.
   - Buyers can only query or cancel their own orders.
3. **Admin Privilege Scope:**
   - Admin can view marketplace products, orders, buyer details, and farmer contact info.
   - Admin **cannot** access private farmer agricultural records (expenses, crop details, daily wages).

## 4. Concurrency & Transaction Management
- Checkout operations execute under `@Transactional(isolation = Isolation.READ_COMMITTED)`.
- Stock deductions are validated against inventory before order persistence. If concurrent checkout reduces stock below requested quantity, an `InsufficientStockException` is thrown, rolling back the transaction.
- Order cancellation and manual payment updates use explicit transactional boundaries with corresponding audit log creation.
