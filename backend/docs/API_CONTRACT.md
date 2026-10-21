# KisanKhata REST API Contract Specification

Base URI: `/api/v1`  
Content-Type: `application/json`  
Authentication: Server-managed Session Cookie (`JSESSIONID`) + CSRF Token (`X-XSRF-TOKEN`).

---

## Standard Response Wrappers

### Success Envelope
```json
{
  "success": true,
  "data": { ... } // or array [ ... ]
}
```

### Error Envelope
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Human-readable description",
  "errors": [
    { "field": "amount", "message": "Amount must be greater than 0" }
  ],
  "timestamp": "2026-10-21T09:00:00Z"
}
```

---

## 1. Authentication & Identity (`/api/v1/auth`)

| Method | Path | Auth | Roles | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|---|
| `POST` | `/auth/register` | Public | None | Register Farmer | `{ firstName, lastName, email, mobile, password, farmName?, address?, state? }` | `201 Created` `{ success: true, data: UserView }` |
| `POST` | `/auth/register-buyer`| Public | None | Register Buyer | `{ firstName, lastName, email, mobile, password, address, city, pinCode }` | `201 Created` `{ success: true, data: UserView }` |
| `POST` | `/auth/login` | Public | None | Login User | `{ email, password }` | `200 OK` `{ success: true, data: UserView }` |
| `GET` | `/auth/me` | Session | Any | Get Current Profile | None | `200 OK` `{ success: true, data: UserView }` |
| `POST` | `/auth/logout` | Session | Any | Logout Session | None | `204 No Content` |
| `GET` | `/auth/csrf` | Public | None | Fetch CSRF Token | None | `200 OK` `{ success: true, token: "..." }` |

---

## 2. Farmer Crops (`/api/v1/farmer/crops`)

| Method | Path | Auth | Roles | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|---|
| `GET` | `/farmer/crops` | Session | FARMER | List farmer's crops | None | `200 OK` `{ success: true, data: Crop[] }` |
| `POST` | `/farmer/crops` | Session | FARMER | Add new crop | `{ name, category?, plantationDate, durationDays?, description? }` | `201 Created` `{ success: true, data: Crop }` |
| `PUT` | `/farmer/crops/{id}` | Session | FARMER | Edit crop | `{ name, category?, plantationDate, durationDays?, description? }` | `200 OK` `{ success: true, data: Crop }` |
| `DELETE`| `/farmer/crops/{id}` | Session | FARMER | Delete crop (fails if expenses exist) | None | `200 OK` `{ success: true, message: "Crop deleted" }` |

---

## 3. Farmer Expenses (`/api/v1/farmer/expenses`)

| Method | Path | Auth | Roles | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|---|
| `GET` | `/farmer/expenses` | Session | FARMER | List expenses (filter by cropId optional) | Query: `?cropId=...` | `200 OK` `{ success: true, data: Expense[], total: 12500.00 }` |
| `POST` | `/farmer/expenses` | Session | FARMER | Record expense | `{ cropId, amount, category, details?, expenseDate }` | `201 Created` `{ success: true, data: Expense }` |
| `PUT` | `/farmer/expenses/{id}`| Session | FARMER | Edit expense | `{ cropId, amount, category, details?, expenseDate }` | `200 OK` `{ success: true, data: Expense }` |
| `DELETE`| `/farmer/expenses/{id}`| Session | FARMER | Delete expense | None | `200 OK` `{ success: true, message: "Expense deleted" }` |

---

## 4. Farmer Workers (`/api/v1/farmer/workers`)

| Method | Path | Auth | Roles | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|---|
| `GET` | `/farmer/workers` | Session | FARMER | List workers and calculated wages | None | `200 OK` `{ success: true, data: Worker[], grandTotal: 23900.00 }` |
| `POST` | `/farmer/workers` | Session | FARMER | Add worker | `{ name, contact, daysWorked, dailyWage, email?, address?, upiId? }` | `201 Created` `{ success: true, data: Worker }` |
| `PUT` | `/farmer/workers/{id}`| Session | FARMER | Edit worker | `{ name, contact, daysWorked, dailyWage, email?, address?, upiId? }` | `200 OK` `{ success: true, data: Worker }` |
| `DELETE`| `/farmer/workers/{id}`| Session | FARMER | Delete worker | None | `200 OK` `{ success: true, message: "Worker deleted" }` |

---

## 5. Field Operations & Reminders (`/api/v1/farmer/*`)

| Method | Path | Auth | Roles | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|---|
| `GET` | `/farmer/water-records` | Session | FARMER | List water records | None | `200 OK` `{ success: true, data: WaterRecord[] }` |
| `POST` | `/farmer/water-records` | Session | FARMER | Add water record | `{ plotName, withFertilizer, quantity, unit, date }` | `201 Created` `{ success: true, data: WaterRecord }` |
| `DELETE`| `/farmer/water-records/{id}` | Session | FARMER | Delete water record | None | `200 OK` `{ success: true }` |
| `GET` | `/farmer/input-records` | Session | FARMER | List fertilizer/pesticide logs | None | `200 OK` `{ success: true, data: InputRecord[] }` |
| `POST` | `/farmer/input-records` | Session | FARMER | Add input record | `{ plotName, productName, quantity, unit, date }` | `201 Created` `{ success: true, data: InputRecord }` |
| `DELETE`| `/farmer/input-records/{id}` | Session | FARMER | Delete input record | None | `200 OK` `{ success: true }` |
| `GET` | `/farmer/reminders` | Session | FARMER | List reminders (sorted) | None | `200 OK` `{ success: true, data: Reminder[] }` |
| `POST` | `/farmer/reminders` | Session | FARMER | Schedule reminder | `{ description, date, time }` | `201 Created` `{ success: true, data: Reminder }` |
| `PATCH` | `/farmer/reminders/{id}/toggle` | Session | FARMER | Mark Done/Undone | None | `200 OK` `{ success: true, data: Reminder }` |
| `DELETE`| `/farmer/reminders/{id}` | Session | FARMER | Dismiss reminder | None | `200 OK` `{ success: true }` |

---

## 6. Reports (`/api/v1/farmer/reports`)

| Method | Path | Auth | Roles | Description | Parameters | Response (Success) |
|---|---|---|---|---|---|---|
| `GET` | `/farmer/reports/summary` | Session | FARMER | High-level dashboard counters | None | `200 OK` `{ success: true, data: { cropCount, expenseCount, totalExpenses, workerCount, totalWorkerWages } }` |
| `GET` | `/farmer/reports/date-wise` | Session | FARMER | Date-range expense report | Query: `?from=YYYY-MM-DD&to=YYYY-MM-DD` | `200 OK` `{ success: true, data: Expense[], totalAmount: 14500.00 }` |
| `GET` | `/farmer/reports/crop-wise` | Session | FARMER | Crop expense report | Query: `?cropId=UUID` | `200 OK` `{ success: true, crop: CropView, expenses: Expense[], totalAmount: 8900.00 }` |
| `GET` | `/farmer/reports/worker-wise`| Session | FARMER | Worker wage report | None | `200 OK` `{ success: true, workers: Worker[], grandTotalWage: 31000.00 }` |

---

## 7. Marketplace & Buyer APIs (`/api/v1/mart`)

| Method | Path | Auth | Roles | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|---|
| `GET` | `/mart/products` | Public | Any | List active produce catalogue | None | `200 OK` `{ success: true, data: ProductView[] }` |
| `GET` | `/mart/products/{id}` | Public | Any | Product details | None | `200 OK` `{ success: true, data: ProductView }` |
| `GET` | `/mart/cart` | Session | BUYER | View active cart | None | `200 OK` `{ success: true, items: CartItemView[], totalAmount: 450.00 }` |
| `POST` | `/mart/cart` | Session | BUYER | Add item to cart | `{ productId, quantity }` | `200 OK` `{ success: true, message: "Cart updated" }` |
| `PUT` | `/mart/cart/{id}` | Session | BUYER | Update cart quantity | `{ quantity }` | `200 OK` `{ success: true }` |
| `DELETE`| `/mart/cart/{id}` | Session | BUYER | Remove item from cart | None | `200 OK` `{ success: true }` |
| `POST` | `/mart/checkout` | Session | BUYER | Atomic checkout & bill creation | `{ shippingAddress, city, pinCode, contactNumber }` | `201 Created` `{ success: true, billNumber, orderId, totalAmount }` |
| `GET` | `/mart/orders` | Session | BUYER | Buyer's order history | None | `200 OK` `{ success: true, data: OrderSummary[] }` |
| `GET` | `/mart/orders/{id}` | Session | BUYER | Order details & bill snapshot | None | `200 OK` `{ success: true, data: OrderDetailView }` |
| `POST` | `/mart/orders/{id}/pay` | Session | BUYER | Report manual UPI payment | None | `200 OK` `{ success: true, status: "PAYMENT_REPORTED" }` |
| `POST` | `/mart/orders/{id}/cancel`| Session | BUYER | Cancel order (Pending only) | None | `200 OK` `{ success: true, status: "CANCELLED" }` |
| `GET` | `/mart/payment-settings` | Public | Any | Fetch UPI ID and QR image | None | `200 OK` `{ success: true, data: PaymentSettingsView }` |

---

## 8. Admin APIs (`/api/v1/admin`)

| Method | Path | Auth | Roles | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|---|
| `GET` | `/admin/dashboard` | Session | ADMIN | KPI statistics | None | `200 OK` `{ success: true, farmerCount, buyerCount, productCount, orderCount, totalRevenue }` |
| `GET` | `/admin/users` | Session | ADMIN | List users | Query: `?role=FARMER|BUYER` | `200 OK` `{ success: true, data: UserListItem[] }` |
| `PATCH` | `/admin/users/{id}/status`| Session| ADMIN | Activate / Deactivate user | `{ active: boolean }` | `200 OK` `{ success: true, message: "User status updated" }` |
| `GET` | `/admin/products` | Session | ADMIN | List all products (incl inactive) | None | `200 OK` `{ success: true, data: ProductAdminView[] }` |
| `POST` | `/admin/products` | Session | ADMIN | Create product | `{ name, category, price, stockQuantity, description, imageUrl? }` | `201 Created` `{ success: true, data: Product }` |
| `PUT` | `/admin/products/{id}` | Session | ADMIN | Update product | `{ name, category, price, stockQuantity, description, imageUrl?, active? }` | `200 OK` `{ success: true, data: Product }` |
| `DELETE`| `/admin/products/{id}` | Session | ADMIN | Soft-delete product | None | `200 OK` `{ success: true }` |
| `POST` | `/admin/upload` | Session | ADMIN | Upload product/QR image | `MultipartFile file` | `201 Created` `{ success: true, fileUrl: "/api/v1/files/..." }` |
| `GET` | `/admin/orders` | Session | ADMIN | Filter orders by status/date | Query: `?status=...&from=...&to=...` | `200 OK` `{ success: true, data: OrderAdminView[], totalPaidAmount }` |
| `PATCH` | `/admin/orders/{id}/status`| Session| ADMIN | Verify UPI payment / Cancel | `{ status: "PAID" | "CANCELLED" }` | `200 OK` `{ success: true, status: "..." }` |
| `GET` | `/admin/payment-settings`| Session| ADMIN | Get UPI payment settings | None | `200 OK` `{ success: true, data: PaymentSettings }` |
| `PUT` | `/admin/payment-settings`| Session| ADMIN | Update UPI payment settings | `{ upiId, qrImageUrl, shopContactNumber, shopName }` | `200 OK` `{ success: true, data: PaymentSettings }` |
| `GET` | `/admin/audit-logs` | Session | ADMIN | View sensitive audit log | None | `200 OK` `{ success: true, data: AuditLogView[] }` |

---

## 9. Observability & System
- `GET /actuator/health` -> `{"status": "UP"}`
- `GET /api/v1/files/{filename}` -> Serves validated uploaded images.
