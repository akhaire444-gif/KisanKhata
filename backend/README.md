# KisanKhata Spring Boot Backend

Initial Java 17 / Spring Boot modular-monolith backend foundation. Current APIs cover authentication and core farmer records. This is not yet a complete implementation of every PRD module and must not be considered production-certified until TODO items and tests are completed.

## Requirements
- Java 17+
- Maven 3.9+

## Run
```bash
cp .env.example .env
mvn spring-boot:run
```
Spring Boot does not automatically load `.env`; export variables in your shell or configure your IDE/run environment. The default local database is H2 file mode under `./data/`.

## Build and test
```bash
mvn clean test
mvn clean package
java -jar target/kisankhata-backend-0.1.0.jar
```

## Current API
See `docs/API_CONTRACT.md`. Health: `GET /actuator/health`.

## Security notes
Public registration creates FARMER only. To bootstrap an admin, set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` (12+ characters). Do not deploy until CSRF/frontend session integration, secure cookie settings, complete tests, database decision and backup restore tests are done.

## Frontend
The supplied React frontend currently uses in-memory state in `src/context/AppContext.tsx`; it is not yet wired to these endpoints. API integration is a required next step.

## Documentation
See `/docs` for requirements, decisions, API, database, security, deployment and TODO.
