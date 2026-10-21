# KisanKhata Database Architecture & Schema Specification

## 1. Storage Engine Evaluation & Decision
- **Provisional Engine:** H2 Database in file mode with PostgreSQL syntax emulation:
  `jdbc:h2:file:./data/kisankhata;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE`
- **Rationale:** Satisfies PRD constraint NFR-26 & NFR-27 for single-command runnable JAR without separate database server installations.
- **Production Assessment:** H2 file-mode provides ACID transactions for single-node deployments. If scaling horizontally across multiple compute nodes, migrate to managed PostgreSQL by updating the `spring.datasource.url` and driver dependency.

## 2. Relational Schema & Entities

### Table: `app_users`
- `id` (VARCHAR(36), PK): UUID
- `first_name` (VARCHAR(120), NOT NULL)
- `last_name` (VARCHAR(120), NOT NULL)
- `email` (VARCHAR(254), NOT NULL, UNIQUE, INDEX: `ux_user_email`)
- `mobile` (VARCHAR(20), NOT NULL)
- `password_hash` (VARCHAR(100), NOT NULL): BCrypt hash
- `role` (VARCHAR(20), NOT NULL): `FARMER`, `BUYER`, `ADMIN`
- `farm_name` (VARCHAR(180))
- `address` (VARCHAR(240))
- `state` (VARCHAR(100))
- `active` (BOOLEAN, NOT NULL, DEFAULT true)
- `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)

### Table: `crops`
- `id` (VARCHAR(36), PK): UUID
- `farmer_id` (VARCHAR(36), NOT NULL, INDEX: `ix_crops_farmer`)
- `name` (VARCHAR(120), NOT NULL)
- `category` (VARCHAR(80))
- `plantation_date` (DATE, NOT NULL)
- `duration_days` (INTEGER)
- `description` (VARCHAR(500))
- `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)
- Constraint: Unique on `(farmer_id, name, plantation_date)` to reject duplicate crops.

### Table: `expenses`
- `id` (VARCHAR(36), PK): UUID
- `farmer_id` (VARCHAR(36), NOT NULL, INDEX: `ix_expenses_farmer`)
- `crop_id` (VARCHAR(36), NOT NULL, INDEX: `ix_expenses_crop`)
- `amount` (NUMERIC(10,2), NOT NULL, CHECK: `amount > 0 AND amount <= 9999999.00`)
- `category` (VARCHAR(80), NOT NULL)
- `details` (VARCHAR(500))
- `expense_date` (DATE, NOT NULL, INDEX: `ix_expenses_date`)
- `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)

### Table: `workers`
- `id` (VARCHAR(36), PK): UUID
- `farmer_id` (VARCHAR(36), NOT NULL, INDEX: `ix_workers_farmer`)
- `name` (VARCHAR(120), NOT NULL)
- `contact` (VARCHAR(20), NOT NULL)
- `days_worked` (INTEGER, NOT NULL, DEFAULT 0, CHECK: `days_worked >= 0 AND days_worked <= 3660`)
- `daily_wage` (NUMERIC(10,2), NOT NULL, CHECK: `daily_wage >= 0`)
- `payment_amount` (NUMERIC(12,2), NOT NULL): Persisted/computed server-side as `days_worked * daily_wage`
- `email` (VARCHAR(254))
- `address` (VARCHAR(240))
- `upi_id` (VARCHAR(100))
- `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)

### Table: `farm_records`
- `id` (VARCHAR(36), PK): UUID
- `farmer_id` (VARCHAR(36), NOT NULL, INDEX: `ix_farm_records_farmer`)
- `record_type` (VARCHAR(20), NOT NULL): `WATER`, `INPUT`, `REMINDER`
- `name` (VARCHAR(120), NOT NULL)
- `description` (VARCHAR(500))
- `plot` (VARCHAR(100))
- `product` (VARCHAR(120))
- `quantity` (VARCHAR(40))
- `fertilizer_used` (BOOLEAN)
- `record_date` (DATE, NOT NULL)
- `reminder_date` (DATE)
- `reminder_time` (VARCHAR(10))
- `is_done` (BOOLEAN, NOT NULL, DEFAULT false)
- `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)

### Table: `products`
- `id` (VARCHAR(36), PK): UUID
- `name` (VARCHAR(150), NOT NULL)
- `description` (VARCHAR(1000))
- `category` (VARCHAR(80), NOT NULL)
- `price` (NUMERIC(10,2), NOT NULL, CHECK: `price > 0`)
- `stock_quantity` (INTEGER, NOT NULL, DEFAULT 0, CHECK: `stock_quantity >= 0`)
- `image_url` (VARCHAR(300))
- `active` (BOOLEAN, NOT NULL, DEFAULT true)
- `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)
- `updated_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)

### Table: `cart_items`
- `id` (VARCHAR(36), PK): UUID
- `buyer_id` (VARCHAR(36), NOT NULL, INDEX: `ix_cart_buyer`)
- `product_id` (VARCHAR(36), NOT NULL)
- `quantity` (INTEGER, NOT NULL, CHECK: `quantity > 0`)
- `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)
- Constraint: Unique on `(buyer_id, product_id)`.

### Table: `orders`
- `id` (VARCHAR(36), PK): UUID
- `bill_number` (VARCHAR(30), NOT NULL, UNIQUE, INDEX: `ux_order_bill`)
- `buyer_id` (VARCHAR(36), NOT NULL, INDEX: `ix_orders_buyer`)
- `buyer_name` (VARCHAR(150), NOT NULL)
- `buyer_contact` (VARCHAR(20), NOT NULL)
- `shipping_address` (VARCHAR(300), NOT NULL)
- `city` (VARCHAR(100), NOT NULL)
- `pin_code` (VARCHAR(10), NOT NULL)
- `total_amount` (NUMERIC(12,2), NOT NULL)
- `status` (VARCHAR(30), NOT NULL): `PENDING_PAYMENT`, `PAYMENT_REPORTED`, `PAID`, `CANCELLED`
- `payment_reported_at` (TIMESTAMP WITH TIME ZONE)
- `payment_verified_at` (TIMESTAMP WITH TIME ZONE)
- `verified_by_admin` (VARCHAR(120))
- `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)

### Table: `order_items`
- `id` (VARCHAR(36), PK): UUID
- `order_id` (VARCHAR(36), NOT NULL, INDEX: `ix_order_items_order`)
- `product_id` (VARCHAR(36), NOT NULL)
- `product_name` (VARCHAR(150), NOT NULL): Snapshot at purchase time
- `unit_price` (NUMERIC(10,2), NOT NULL): Snapshot at purchase time
- `quantity` (INTEGER, NOT NULL)
- `line_total` (NUMERIC(12,2), NOT NULL)

### Table: `payment_settings`
- `id` (VARCHAR(36), PK): Single configuration row (`DEFAULT`)
- `upi_id` (VARCHAR(100))
- `qr_image_url` (VARCHAR(300))
- `shop_contact_number` (VARCHAR(20))
- `shop_name` (VARCHAR(120))
- `updated_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)

### Table: `audit_logs`
- `id` (VARCHAR(36), PK): UUID
- `action` (VARCHAR(80), NOT NULL)
- `performed_by` (VARCHAR(120), NOT NULL)
- `target_id` (VARCHAR(100))
- `details` (VARCHAR(1000))
- `ip_address` (VARCHAR(60))
- `timestamp` (TIMESTAMP WITH TIME ZONE, NOT NULL)

## 3. Data Integrity & Constraints
1. **Cascade Restraints:** Deleting a crop is blocked if associated expenses exist (`FR-CROP-04`).
2. **Monetary Precision:** All currency fields utilize `NUMERIC(10, 2)` or `NUMERIC(12, 2)` mapped to `java.math.BigDecimal` to prevent floating-point rounding errors.
3. **Inventory Non-Negativity:** Stock deduction queries enforce `stock_quantity >= quantity` atomically.
4. **Backup & Disaster Recovery:** The `./data` folder contains `kisankhata.mv.db` which can be copied while stopped or hot-backed up via H2 `BACKUP TO './data/backup.zip'`.
