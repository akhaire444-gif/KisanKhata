# Multi-stage build for KisanKhata Spring Boot Backend
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build jar
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create directories for local H2 database file and upload storage
RUN mkdir -p /app/data /app/data/uploads

# Copy packaged jar from builder
COPY --from=builder /app/target/*.jar app.jar

# Expose default port (Render will inject PORT env var dynamically)
EXPOSE 8080
ENV PORT=8080

ENTRYPOINT ["java", "-jar", "app.jar"]
