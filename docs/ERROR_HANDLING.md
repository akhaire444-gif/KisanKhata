# KisanKhata Centralized Error Handling & Exception Strategy

## 1. Error Response Architecture
All backend controllers delegate exception handling to a global `@RestControllerAdvice` (`ApiExceptionHandler`).

### Standard JSON Error Payload
```json
{
  "success": false,
  "code": "STRING_ERROR_CODE",
  "message": "User-friendly description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation message"
    }
  ],
  "timestamp": "2026-10-21T09:15:30.123Z"
}
```

## 2. HTTP Status Code Mapping

| Exception Class | HTTP Status | Error Code | Example Cause |
|---|---|---|---|
| `MethodArgumentNotValidException` | `400 Bad Request` | `VALIDATION_ERROR` | Required field missing, invalid email, negative amount |
| `IllegalArgumentException` | `400 Bad Request` | `BAD_REQUEST` | Business rule violation (e.g. reminder in the past) |
| `DuplicateResourceException` | `409 Conflict` | `DUPLICATE_RESOURCE` | Duplicate crop name and date, email already registered |
| `ResourceInUseException` | `409 Conflict` | `RESOURCE_IN_USE` | Deleting crop that has active expenses |
| `InsufficientStockException` | `409 Conflict` | `OUT_OF_STOCK` | Product stock insufficient at checkout |
| `AuthenticationException` / Bad credentials | `401 Unauthorized` | `UNAUTHORIZED` | Invalid email or password |
| `AccountLockedException` | `429 Too Many Requests` | `ACCOUNT_LOCKED` | 5 failed logins within 10 minutes |
| `DisabledException` | `403 Forbidden` | `ACCOUNT_DISABLED` | User account deactivated by admin |
| `AccessDeniedException` | `403 Forbidden` | `FORBIDDEN` | Missing required role or cross-tenant access violation |
| `NoSuchElementException` / `ResourceNotFoundException` | `404 Not Found` | `NOT_FOUND` | Requested entity ID does not exist or belongs to another tenant |
| `MaxUploadSizeExceededException` | `413 Payload Too Large` | `FILE_TOO_LARGE` | Image upload exceeds 1 MB |
| `UnsupportedMediaTypeException` | `415 Unsupported Media Type` | `INVALID_FILE_TYPE` | Non-image upload attempted |
| `Exception` (catch-all) | `500 Internal Server Error` | `INTERNAL_ERROR` | Unhandled server error (stack trace logged, never returned to client) |

## 3. Production Sanitization Guardrails
- **Stack Trace Redaction:** Stack traces are strictly logged on the server with correlation IDs; `server.error.include-stacktrace: never` prevents stack traces leaking over HTTP.
- **Credential Masking:** Passwords, hashes, and session cookies are filtered from operational logs.
- **User Privacy:** Logs must not contain personally identifiable agricultural financial data.
