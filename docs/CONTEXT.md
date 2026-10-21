# KisanKhata Context & System Overview

## 1. Executive Summary
- **Product Name:** KisanKhata (formerly TechFarm)
- **Vision:** A simple, low-cost farm bookkeeping system and direct farm-fresh marketplace. Farmers record crops, expenses, worker wages, irrigation, fertilizer/pesticide inputs, and reminders without paperwork or complex accounting software. Buyers browse produce and place orders with manual UPI payment verification. An administrator operates the catalog, verifies UPI payments, and manages users.
- **Architecture Style:** Modular Monolith (Single runnable JAR, Java 17+, Spring Boot 3.4.x, Spring Web MVC, Spring Security, Spring Data JPA).
- **Target Deployment:** Low-cost Linux VM or cloud instance running one self-contained JAR (`kisankhata.jar`) with embedded file-based relational database (H2 in PostgreSQL mode, path `./data/kisankhata`) and local file storage (`./data/uploads`).

## 2. User Roles & Personas
1. **Visitor:** Public guest browsing home, About/Contact, and active marketplace produce catalogue.
2. **Farmer:** Authenticated user with private tenant boundary (`farmerId`). Manages crops, expenses, workers & wages, irrigation, agrochemical inputs, reminders, and financial reports.
3. **Buyer:** Authenticated marketplace customer with private boundary (`buyerId`). Manages shopping cart, checkout, orders, bills, and payment reporting.
4. **Admin:** System and mart operator bootstrapped securely via environment variables (`BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`). Manages product catalogue, inventory, orders, payment verification, user status, and UPI settings. Admin has no access to private farmer ledger data.

## 3. Technology Stack & Boundaries
- **Runtime:** Java 17 LTS or later
- **Framework:** Spring Boot 3.4.x
- **Persistence:** Spring Data JPA with Hibernate, HikariCP, and H2 File-mode database (PostgreSQL compatibility mode).
- **Security:** Spring Security 6 session-based authentication (`JSESSIONID`, HttpOnly, SameSite=Lax), BCrypt password hashing (strength 12), Cookie-backed CSRF protection (`XSRF-TOKEN`), role-based and object-level ownership authorization.
- **Testing:** JUnit 5, MockMvc, AssertJ, Spring Security Test.
- **Frontend:** React 19 SPA (Vite + Tailwind CSS v4) communicating over REST API (`/api/v1`).

## 4. Source of Truth Priority
1. Explicit requirements in `KisanKhata_PRD.pdf` (Version 1.0, 11 October 2026).
2. Architecture Blueprint in `architecture.png`.
3. Existing React frontend behavior, contracts, and component models.
4. Existing Spring Boot backend code.
5. Documented engineering decisions in `/docs/DECISIONS.md`.
