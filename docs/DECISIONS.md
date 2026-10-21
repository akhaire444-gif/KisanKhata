# KisanKhata Architecture Decision Records (ADR)

## DEC-001 — Modular Monolith Architecture
- **Status:** Approved
- **Context:** PRD requires a simple, single-package deployment for low operational overhead (`NFR-26`).
- **Decision:** Build a single Spring Boot application with strictly partitioned domain packages (`auth`, `farm`, `marketplace`, `admin`, `common`, `storage`).
- **Consequences:** Avoids distributed network latency, distributed transactions, and Kubernetes/message broker infrastructure. Fast development and straightforward CI/CD.

## DEC-002 — Server-Managed Session Authentication
- **Status:** Approved
- **Context:** The system serves a single React SPA in modern browsers without public external mobile native clients.
- **Decision:** Use Spring Security standard session management (`JSESSIONID`) over HTTPS with `HttpOnly`, `SameSite=Lax`, and `Secure` cookie attributes.
- **Consequences:** Eliminates client-side JWT token storage vulnerabilities (XSS token theft) and avoids complex token refresh dance. Requires CSRF protection for state-changing HTTP methods.

## DEC-003 — Cookie-Backed CSRF Protection for SPA
- **Status:** Approved
- **Context:** Session cookie authentication requires defense against Cross-Site Request Forgery.
- **Decision:** Configure Spring Security `CookieCsrfTokenRepository.withHttpOnlyFalse()`. The server issues an `XSRF-TOKEN` cookie, and the frontend client reads and transmits it in the `X-XSRF-TOKEN` HTTP header on POST/PUT/PATCH/DELETE requests.
- **Consequences:** Protects all state-modifying requests while allowing standard JavaScript SPA fetch/Axios clients to operate seamlessly.

## DEC-004 — Manual Static UPI Verification Workflow
- **Status:** Approved
- **Context:** PRD explicitly excludes third-party payment gateways (Razorpay, Stripe) to avoid commercial merchant fees, KYC delays, and gateway failure points.
- **Decision:** Display the admin's verified UPI ID and QR code on the payment screen. The buyer confirms with "I have paid" (`PAYMENT_REPORTED`), and the admin verifies receipt in their banking application before marking the order `PAID`.
- **Consequences:** Zero payment gateway fees. Requires clear order state transitions and admin audit logging.

## DEC-005 — Embedded Relational Engine (H2 File-Mode)
- **Status:** Approved (Provisional for MVP)
- **Context:** PRD Section 8.4 requires single-JAR execution without requiring the operator to install PostgreSQL or MySQL.
- **Decision:** Use H2 Database in file mode with PostgreSQL syntax emulation (`MODE=PostgreSQL`).
- **Consequences:** Meets the zero-install single-JAR requirement. Easy backup by copying the `./data` folder. If multi-instance horizontal scaling is required in the future, Spring Data JPA allows switching to a managed PostgreSQL cluster via configuration changes alone.

## DEC-006 — Optimistic Locking and Concurrency for Checkout
- **Status:** Approved
- **Context:** Multiple buyers might attempt to checkout the last available stock simultaneously.
- **Decision:** Use transactional stock checks with database-level constraints and atomic quantity updates (`UPDATE products SET stock_quantity = stock_quantity - :qty WHERE id = :id AND stock_quantity >= :qty`).
- **Consequences:** Prevents overselling without requiring distributed locks or Redis.
