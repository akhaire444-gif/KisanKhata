package in.kisankhata.mart;

import in.kisankhata.user.AppUser;
import in.kisankhata.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class MarketplaceService {

    private final ProductRepository productRepo;
    private final CartItemRepository cartRepo;
    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final PaymentSettingsRepository paymentSettingsRepo;
    private final UserRepository userRepo;

    public MarketplaceService(
        ProductRepository productRepo,
        CartItemRepository cartRepo,
        OrderRepository orderRepo,
        OrderItemRepository orderItemRepo,
        PaymentSettingsRepository paymentSettingsRepo,
        UserRepository userRepo
    ) {
        this.productRepo = productRepo;
        this.cartRepo = cartRepo;
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.paymentSettingsRepo = paymentSettingsRepo;
        this.userRepo = userRepo;
    }

    public PaymentSettings getPaymentSettings() {
        return paymentSettingsRepo.findById("DEFAULT").orElseGet(() -> {
            PaymentSettings initial = new PaymentSettings();
            return paymentSettingsRepo.save(initial);
        });
    }

    public List<CartItemDetail> getBuyerCart(String buyerId) {
        List<CartItem> items = cartRepo.findAllByBuyerIdOrderByCreatedAtDesc(buyerId);
        List<CartItemDetail> details = new ArrayList<>();
        for (CartItem ci : items) {
            Product p = productRepo.findById(ci.getProductId()).orElse(null);
            if (p != null) {
                BigDecimal lineTotal = p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
                details.add(new CartItemDetail(ci.getId(), p.getId(), p.getName(), p.getImageUrl(), p.getPrice(), ci.getQuantity(), p.getStockQuantity(), lineTotal));
            }
        }
        return details;
    }

    public CartItem addToCart(String buyerId, String productId, int quantity) {
        Product product = productRepo.findByIdAndActiveTrue(productId)
            .orElseThrow(() -> new NoSuchElementException("Product not found or inactive"));

        if (product.getStockQuantity() <= 0) {
            throw new IllegalStateException("Product is out of stock");
        }

        int qtyToAdd = Math.max(1, quantity);
        return cartRepo.findByBuyerIdAndProductId(buyerId, productId)
            .map(existing -> {
                int newQty = existing.getQuantity() + qtyToAdd;
                if (newQty > product.getStockQuantity()) {
                    newQty = product.getStockQuantity();
                }
                existing.setQuantity(newQty);
                return cartRepo.save(existing);
            })
            .orElseGet(() -> {
                int finalQty = Math.min(qtyToAdd, product.getStockQuantity());
                return cartRepo.save(new CartItem(buyerId, productId, finalQty));
            });
    }

    public CartItem updateCartQuantity(String buyerId, String cartItemId, int quantity) {
        CartItem item = cartRepo.findByIdAndBuyerId(cartItemId, buyerId)
            .orElseThrow(() -> new NoSuchElementException("Cart item not found"));

        if (quantity <= 0) {
            cartRepo.delete(item);
            return null;
        }

        Product product = productRepo.findById(item.getProductId())
            .orElseThrow(() -> new NoSuchElementException("Product not found"));

        int finalQty = Math.min(quantity, Math.max(1, product.getStockQuantity()));
        item.setQuantity(finalQty);
        return cartRepo.save(item);
    }

    public void removeCartItem(String buyerId, String cartItemId) {
        CartItem item = cartRepo.findByIdAndBuyerId(cartItemId, buyerId)
            .orElseThrow(() -> new NoSuchElementException("Cart item not found"));
        cartRepo.delete(item);
    }

    @Transactional
    public Order checkout(String buyerId, String shippingAddress, String city, String pinCode, String contactNumber) {
        List<CartItem> cartItems = cartRepo.findAllByBuyerIdOrderByCreatedAtDesc(buyerId);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cannot checkout with an empty cart");
        }

        AppUser buyer = userRepo.findById(buyerId)
            .orElseThrow(() -> new NoSuchElementException("Buyer account not found"));

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> pendingOrderItems = new ArrayList<>();

        for (CartItem ci : cartItems) {
            Product product = productRepo.findByIdAndActiveTrue(ci.getProductId())
                .orElseThrow(() -> new NoSuchElementException("Product not available"));

            // Atomic anti-overselling stock deduction
            int rowsUpdated = productRepo.atomicDeductStock(product.getId(), ci.getQuantity());
            if (rowsUpdated == 0) {
                throw new IllegalStateException("Insufficient stock for product: " + product.getName() + " (Available: " + product.getStockQuantity() + ")");
            }

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);

            pendingOrderItems.add(new OrderItem(null, product.getId(), product.getName(), product.getPrice(), ci.getQuantity()));
        }

        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String billNumber = "KK-" + datePrefix + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        String contact = (contactNumber != null && !contactNumber.isBlank()) ? contactNumber.trim() : buyer.getMobile();
        String address = (shippingAddress != null && !shippingAddress.isBlank()) ? shippingAddress.trim() : buyer.getAddress();
        String cCity = (city != null && !city.isBlank()) ? city.trim() : buyer.getCity();
        String cPin = (pinCode != null && !pinCode.isBlank()) ? pinCode.trim() : buyer.getPinCode();

        Order order = orderRepo.save(new Order(
            billNumber,
            buyerId,
            buyer.getFirstName() + " " + buyer.getLastName(),
            contact != null ? contact : "0000000000",
            address != null ? address : "Default Shipping Address",
            cCity != null ? cCity : "Nashik",
            cPin != null ? cPin : "422001",
            totalAmount
        ));

        for (OrderItem oi : pendingOrderItems) {
            orderItemRepo.save(new OrderItem(order.getId(), oi.getProductId(), oi.getProductName(), oi.getUnitPrice(), oi.getQuantity()));
        }

        // Clear cart upon successful transactional checkout
        cartRepo.deleteAllByBuyerId(buyerId);

        return order;
    }

    @Transactional
    public Order reportPayment(String orderId, String buyerId) {
        Order order = orderRepo.findByIdAndBuyerId(orderId, buyerId)
            .orElseThrow(() -> new NoSuchElementException("Order not found"));
        order.reportPayment();
        return orderRepo.save(order);
    }

    @Transactional
    public Order cancelOrder(String orderId, String buyerId) {
        Order order = orderRepo.findByIdAndBuyerId(orderId, buyerId)
            .orElseThrow(() -> new NoSuchElementException("Order not found"));

        if (order.getStatus() == OrderStatus.PAID) {
            throw new IllegalStateException("Cannot cancel an order that has already been verified as PAID");
        }

        // Restore stock
        List<OrderItem> items = orderItemRepo.findAllByOrderId(orderId);
        for (OrderItem item : items) {
            productRepo.findById(item.getProductId()).ifPresent(p -> {
                p.restoreStock(item.getQuantity());
                productRepo.save(p);
            });
        }

        order.cancel();
        return orderRepo.save(order);
    }

    public OrderDetail getOrderDetail(String orderId, String buyerId) {
        Order order = orderRepo.findByIdAndBuyerId(orderId, buyerId)
            .orElseThrow(() -> new NoSuchElementException("Order not found"));
        List<OrderItem> items = orderItemRepo.findAllByOrderId(orderId);
        return new OrderDetail(order, items);
    }

    public record CartItemDetail(
        String id,
        String productId,
        String productName,
        String imageUrl,
        BigDecimal unitPrice,
        int quantity,
        int availableStock,
        BigDecimal lineTotal
    ) {}

    public record OrderDetail(Order order, List<OrderItem> items) {}
}
