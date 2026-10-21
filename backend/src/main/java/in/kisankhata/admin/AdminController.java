package in.kisankhata.admin;

import in.kisankhata.mart.MarketplaceService;
import in.kisankhata.mart.Order;
import in.kisankhata.mart.OrderItem;
import in.kisankhata.mart.OrderItemRepository;
import in.kisankhata.mart.OrderRepository;
import in.kisankhata.mart.OrderStatus;
import in.kisankhata.mart.PaymentSettings;
import in.kisankhata.mart.PaymentSettingsRepository;
import in.kisankhata.mart.Product;
import in.kisankhata.mart.ProductRepository;
import in.kisankhata.user.AppUser;
import in.kisankhata.user.Role;
import in.kisankhata.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final ProductRepository productRepo;
    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final PaymentSettingsRepository paymentSettingsRepo;
    private final UserRepository userRepo;
    private final AuditLogRepository auditLogRepo;
    private final FileUploadService fileService;

    public AdminController(
        ProductRepository productRepo,
        OrderRepository orderRepo,
        OrderItemRepository orderItemRepo,
        PaymentSettingsRepository paymentSettingsRepo,
        UserRepository userRepo,
        AuditLogRepository auditLogRepo,
        FileUploadService fileService
    ) {
        this.productRepo = productRepo;
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.paymentSettingsRepo = paymentSettingsRepo;
        this.userRepo = userRepo;
        this.auditLogRepo = auditLogRepo;
        this.fileService = fileService;
    }

    public record ProductRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Size(max = 80) String category,
        @NotNull @DecimalMin("0.01") @DecimalMax("9999999.00") BigDecimal price,
        @Min(0) int stockQuantity,
        @Size(max = 1000) String description,
        @Size(max = 300) String imageUrl,
        Boolean active
    ) {}

    public record UserStatusRequest(
        boolean active
    ) {}

    public record OrderStatusRequest(
        @NotBlank String status
    ) {}

    public record PaymentSettingsRequest(
        @NotBlank @Size(max = 100) String upiId,
        @Size(max = 300) String qrImageUrl,
        @Size(max = 20) String shopContactNumber,
        @Size(max = 120) String shopName
    ) {}

    // 1. Dashboard KPI
    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        long farmerCount = userRepo.findAll().stream().filter(u -> u.getRole() == Role.FARMER).count();
        long buyerCount = userRepo.findAll().stream().filter(u -> u.getRole() == Role.BUYER).count();
        long productCount = productRepo.count();
        List<Order> allOrders = orderRepo.findAll();
        long orderCount = allOrders.size();

        BigDecimal totalRevenue = allOrders.stream()
            .filter(o -> o.getStatus() == OrderStatus.PAID)
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "farmerCount", farmerCount,
            "buyerCount", buyerCount,
            "productCount", productCount,
            "orderCount", orderCount,
            "totalRevenue", totalRevenue
        ));
    }

    // 2. User Management
    @GetMapping("/users")
    public ResponseEntity<?> listUsers(@RequestParam(required = false) String role) {
        List<AppUser> users;
        if (role != null && !role.isBlank()) {
            Role r = Role.valueOf(role.trim().toUpperCase());
            users = userRepo.findAll().stream().filter(u -> u.getRole() == r).toList();
        } else {
            users = userRepo.findAll();
        }
        return ResponseEntity.ok(Map.of("success", true, "data", users));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(
        @PathVariable String id,
        @Valid @RequestBody UserStatusRequest r,
        Authentication a,
        HttpServletRequest req
    ) {
        AppUser user = userRepo.findById(id).orElseThrow(NoSuchElementException::new);
        user.setActive(r.active());
        userRepo.save(user);

        logAudit("USER_STATUS_CHANGE", a.getName(), id, "Active set to: " + r.active(), req.getRemoteAddr());
        return ResponseEntity.ok(Map.of("success", true, "message", "User status updated", "active", user.isActive()));
    }

    // 3. Product Catalog Management
    @GetMapping("/products")
    public ResponseEntity<?> listProducts() {
        List<Product> products = productRepo.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(Map.of("success", true, "data", products));
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(
        @Valid @RequestBody ProductRequest r,
        Authentication a,
        HttpServletRequest req
    ) {
        Product p = productRepo.save(new Product(
            r.name(),
            r.description(),
            r.category(),
            r.price(),
            r.stockQuantity(),
            r.imageUrl()
        ));
        logAudit("PRODUCT_CREATE", a.getName(), p.getId(), "Created product: " + p.getName(), req.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", p));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(
        @PathVariable String id,
        @Valid @RequestBody ProductRequest r,
        Authentication a,
        HttpServletRequest req
    ) {
        Product p = productRepo.findById(id).orElseThrow(NoSuchElementException::new);
        p.update(r.name(), r.description(), r.category(), r.price(), r.stockQuantity(), r.imageUrl(), r.active());
        Product saved = productRepo.save(p);
        logAudit("PRODUCT_UPDATE", a.getName(), id, "Updated product: " + p.getName(), req.getRemoteAddr());
        return ResponseEntity.ok(Map.of("success", true, "data", saved));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable String id, Authentication a, HttpServletRequest req) {
        Product p = productRepo.findById(id).orElseThrow(NoSuchElementException::new);
        p.setActive(false);
        productRepo.save(p);
        logAudit("PRODUCT_SOFT_DELETE", a.getName(), id, "Soft-deleted product: " + p.getName(), req.getRemoteAddr());
        return ResponseEntity.ok(Map.of("success", true, "message", "Product marked inactive"));
    }

    // 4. File Upload (1 MB limit, magic byte validation)
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file, Authentication a, HttpServletRequest req) {
        String url = fileService.storeFile(file);
        logAudit("FILE_UPLOAD", a.getName(), null, "Uploaded file: " + url, req.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "fileUrl", url));
    }

    // 5. Orders Management
    @GetMapping("/orders")
    public ResponseEntity<?> listOrders(@RequestParam(required = false) String status) {
        List<Order> orders;
        if (status != null && !status.isBlank()) {
            OrderStatus s = OrderStatus.valueOf(status.trim().toUpperCase());
            orders = orderRepo.findAllByStatusOrderByCreatedAtDesc(s);
        } else {
            orders = orderRepo.findAllByOrderByCreatedAtDesc();
        }

        BigDecimal totalPaidAmount = orders.stream()
            .filter(o -> o.getStatus() == OrderStatus.PAID)
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", orders,
            "totalPaidAmount", totalPaidAmount
        ));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
        @PathVariable String id,
        @Valid @RequestBody OrderStatusRequest r,
        Authentication a,
        HttpServletRequest req
    ) {
        Order order = orderRepo.findById(id).orElseThrow(NoSuchElementException::new);
        OrderStatus targetStatus = OrderStatus.valueOf(r.status().trim().toUpperCase());

        if (targetStatus == OrderStatus.PAID) {
            order.markPaid(a.getName());
        } else if (targetStatus == OrderStatus.CANCELLED) {
            if (order.getStatus() == OrderStatus.PAID) {
                throw new IllegalStateException("Cannot cancel an order that is already marked as PAID");
            }
            // Restore inventory stock
            List<OrderItem> items = orderItemRepo.findAllByOrderId(id);
            for (OrderItem item : items) {
                productRepo.findById(item.getProductId()).ifPresent(p -> {
                    p.restoreStock(item.getQuantity());
                    productRepo.save(p);
                });
            }
            order.cancel();
        } else {
            throw new IllegalArgumentException("Unsupported status transition: " + targetStatus);
        }

        Order saved = orderRepo.save(order);
        logAudit("ORDER_STATUS_CHANGE", a.getName(), id, "Status updated to " + targetStatus, req.getRemoteAddr());
        return ResponseEntity.ok(Map.of("success", true, "status", saved.getStatus().name(), "order", saved));
    }

    // 6. Payment Settings Configuration
    @GetMapping("/payment-settings")
    public ResponseEntity<?> getPaymentSettings() {
        PaymentSettings settings = paymentSettingsRepo.findById("DEFAULT").orElseGet(() -> {
            PaymentSettings initial = new PaymentSettings();
            return paymentSettingsRepo.save(initial);
        });
        return ResponseEntity.ok(Map.of("success", true, "data", settings));
    }

    @PutMapping("/payment-settings")
    public ResponseEntity<?> updatePaymentSettings(
        @Valid @RequestBody PaymentSettingsRequest r,
        Authentication a,
        HttpServletRequest req
    ) {
        PaymentSettings settings = paymentSettingsRepo.findById("DEFAULT").orElseGet(PaymentSettings::new);
        settings.update(r.upiId(), r.qrImageUrl(), r.shopContactNumber(), r.shopName());
        PaymentSettings saved = paymentSettingsRepo.save(settings);
        logAudit("PAYMENT_SETTINGS_UPDATE", a.getName(), "DEFAULT", "Updated UPI ID: " + r.upiId(), req.getRemoteAddr());
        return ResponseEntity.ok(Map.of("success", true, "data", saved));
    }

    // 7. Audit Log Viewer
    @GetMapping("/audit-logs")
    public ResponseEntity<?> listAuditLogs() {
        List<AuditLog> logs = auditLogRepo.findAllByOrderByTimestampDesc();
        return ResponseEntity.ok(Map.of("success", true, "data", logs));
    }

    private void logAudit(String action, String performedBy, String targetId, String details, String ipAddress) {
        try {
            auditLogRepo.save(new AuditLog(action, performedBy, targetId, details, ipAddress));
        } catch (Exception ignored) {
            // Audit logging should never prevent transaction completion
        }
    }
}
