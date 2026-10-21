# KisanKhata Server-Side Validation Rules & Specifications

## 1. Authentication & Users
- **First Name / Last Name:** `@NotBlank`, `@Size(max = 120)`
- **Email:** `@NotBlank`, `@Email`, `@Size(max = 254)`. Normalized to lowercase.
- **Mobile Number:** `@NotBlank`, `@Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be exactly 10 digits")`
- **Password:** `@NotBlank`, `@Size(min = 6, max = 72, message = "Password must be at least 6 characters")`
- **Address / Farm Name / State:** `@Size(max = 240)`

## 2. Crops
- **Name:** `@NotBlank`, `@Size(max = 120)`
- **Category:** Optional, `@Size(max = 80)` (e.g., Fruit, Grain, Cash Crop, Vegetables)
- **Plantation Date:** `@NotNull`, valid `LocalDate`
- **Duration Days:** Optional, `@Min(1)`, `@Max(999)`
- **Description:** Optional, `@Size(max = 500)`
- **Unique Invariant:** `(farmerId, name, plantationDate)` checked prior to insert.

## 3. Expenses
- **Crop ID:** `@NotBlank`, valid UUID. Must belong to authenticated farmer.
- **Amount:** `@NotNull`, `@DecimalMin("0.01")`, `@DecimalMax("9999999.00")`
- **Category:** `@NotBlank`, `@Size(max = 80)`
- **Details:** Optional, `@Size(max = 500)`
- **Expense Date:** `@NotNull`, cannot be in the future (`@PastOrPresent`)

## 4. Workers & Wages
- **Name:** `@NotBlank`, `@Size(max = 120)`
- **Contact:** `@NotBlank`, `@Pattern(regexp = "^[0-9]{10}$")`
- **Days Worked:** `@NotNull`, `@Min(0)`, `@Max(366)`
- **Daily Wage:** `@NotNull`, `@DecimalMin("0.00")`, `@DecimalMax("999999.00")`
- **Calculated Total:** Server calculates `paymentAmount = daysWorked * dailyWage`
- **Email:** Optional, valid `@Email`
- **Address / UPI ID:** Optional, bounded string lengths

## 5. Field Operations & Reminders
- **Water Record:**
  - `plotName`: `@NotBlank`, `@Size(max = 100)`
  - `quantity`: `@NotNull`, `@Positive`
  - `unit`: `@NotBlank`, must be `Litres` or `Hours`
  - `date`: `@NotNull`, `@PastOrPresent`
- **Input Record (Fertilizer / Pesticide):**
  - `plotName`: `@NotBlank`, `@Size(max = 100)`
  - `productName`: `@NotBlank`, `@Size(max = 120)`
  - `quantity`: `@NotNull`, `@Positive`
  - `unit`: `@NotBlank`, must be `ml` or `kg`
  - `date`: `@NotNull`, `@PastOrPresent`
- **Reminder:**
  - `description`: `@NotBlank`, `@Size(max = 100)`
  - `date`: `@NotNull`
  - `time`: `@NotBlank`, format `HH:mm`
  - Invariant: `LocalDateTime.of(date, time)` must be strictly after current timestamp.

## 6. Marketplace & Orders
- **Product:**
  - `name`: `@NotBlank`, `@Size(max = 150)`
  - `category`: `@NotBlank`, `@Size(max = 80)`
  - `price`: `@NotNull`, `@DecimalMin("0.01")`
  - `stockQuantity`: `@NotNull`, `@Min(0)`
- **Cart Item:**
  - `productId`: `@NotBlank`
  - `quantity`: `@NotNull`, `@Min(1)`
- **Checkout:**
  - `shippingAddress`: `@NotBlank`, `@Size(max = 300)`
  - `city`: `@NotBlank`, `@Size(max = 100)`
  - `pinCode`: `@NotBlank`, `@Pattern(regexp = "^[0-9]{6}$", message = "PIN code must be exactly 6 digits")`
  - `contactNumber`: `@NotBlank`, `@Pattern(regexp = "^[0-9]{10}$", message = "Contact must be 10 digits")`
