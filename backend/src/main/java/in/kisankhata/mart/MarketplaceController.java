package in.kisankhata.mart;

import in.kisankhata.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/mart")
public class MarketplaceController {

    private final ProductRepository productRepo;
    private final OrderRepository orderRepo;
    private final MarketplaceService martService;
    private final UserRepository userRepo;

    public MarketplaceController(
        ProductRepository productRepo,
        OrderRepository orderRepo,
        MarketplaceService martService,
        UserRepository userRepo
    ) {
        this.productRepo = productRepo;
        this.orderRepo = orderRepo;
        this.martService = martService;
        this.userRepo = userRepo;
    }

    public record AddToCartRequest(
        @NotBlank String productId,
        @Min(1) int quantity
    ) {}

    public record UpdateCartRequest(
        @Min(0) int quantity
    ) {}

    public record CheckoutRequest(
        @NotBlank @Size(max = 300) String shippingAddress,
        @NotBlank @Size(max = 100) String city,
        @NotBlank @Size(max = 10) String pinCode,
        String contactNumber
    ) {}

    // 1. Catalog (Public)
    @GetMapping("/products")
    public ResponseEntity<?> listProducts() {
        List<Product> products = productRepo.findAllByActiveTrueOrderByCreatedAtDesc();
        return ResponseEntity.ok(Map.of("success", true, "data", products));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProduct(@PathVariable String id) {
        Product product = productRepo.findByIdAndActiveTrue(id)
            .orElseThrow(() -> new NoSuchElementException("Product not found"));
        return ResponseEntity.ok(Map.of("success", true, "data", product));
    }

    // 2. Cart (Buyer)
    @GetMapping("/cart")
    public ResponseEntity<?> viewCart(Authentication a) {
        String buyerId = buyerId(a);
        List<MarketplaceService.CartItemDetail> items = martService.getBuyerCart(buyerId);
        BigDecimal totalAmount = items.stream()
            .map(MarketplaceService.CartItemDetail::lineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "items", items,
            "totalAmount", totalAmount
        ));
    }

    @PostMapping("/cart")
    public ResponseEntity<?> addToCart(@Valid @RequestBody AddToCartRequest r, Authentication a) {
        String buyerId = buyerId(a);
        CartItem saved = martService.addToCart(buyerId, r.productId(), r.quantity());
        return ResponseEntity.ok(Map.of("success", true, "message", "Cart updated", "data", saved));
    }

    @PutMapping("/cart/{id}")
    public ResponseEntity<?> updateCart(@PathVariable String id, @Valid @RequestBody UpdateCartRequest r, Authentication a) {
        String buyerId = buyerId(a);
        CartItem updated = martService.updateCartQuantity(buyerId, id, r.quantity());
        return ResponseEntity.ok(Map.of("success", true, "message", "Cart item updated", "data", updated != null ? updated : Map.of()));
    }

    @DeleteMapping("/cart/{id}")
    public ResponseEntity<?> removeFromCart(@PathVariable String id, Authentication a) {
        String buyerId = buyerId(a);
        martService.removeCartItem(buyerId, id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Item removed from cart"));
    }

    // 3. Checkout & Orders (Buyer)
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@Valid @RequestBody CheckoutRequest r, Authentication a) {
        String buyerId = buyerId(a);
        Order order = martService.checkout(buyerId, r.shippingAddress(), r.city(), r.pinCode(), r.contactNumber());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "success", true,
            "billNumber", order.getBillNumber(),
            "orderId", order.getId(),
            "totalAmount", order.getTotalAmount(),
            "order", order
        ));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> listOrders(Authentication a) {
        String buyerId = buyerId(a);
        List<Order> orders = orderRepo.findAllByBuyerIdOrderByCreatedAtDesc(buyerId);
        return ResponseEntity.ok(Map.of("success", true, "data", orders));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderDetail(@PathVariable String id, Authentication a) {
        String buyerId = buyerId(a);
        MarketplaceService.OrderDetail detail = martService.getOrderDetail(id, buyerId);
        return ResponseEntity.ok(Map.of("success", true, "data", detail));
    }

    @PostMapping("/orders/{id}/pay")
    public ResponseEntity<?> reportPayment(@PathVariable String id, Authentication a) {
        String buyerId = buyerId(a);
        Order order = martService.reportPayment(id, buyerId);
        return ResponseEntity.ok(Map.of("success", true, "status", order.getStatus().name(), "order", order));
    }

    @PostMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable String id, Authentication a) {
        String buyerId = buyerId(a);
        Order order = martService.cancelOrder(id, buyerId);
        return ResponseEntity.ok(Map.of("success", true, "status", order.getStatus().name(), "order", order));
    }

    // 4. Payment Settings (Public)
    @GetMapping("/payment-settings")
    public ResponseEntity<?> getPaymentSettings() {
        PaymentSettings settings = martService.getPaymentSettings();
        return ResponseEntity.ok(Map.of("success", true, "data", settings));
    }

    private String buyerId(Authentication a) {
        return userRepo.findByEmailIgnoreCase(a.getName()).orElseThrow().getId();
    }
}
