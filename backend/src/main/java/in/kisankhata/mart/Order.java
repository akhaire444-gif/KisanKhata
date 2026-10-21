package in.kisankhata.mart;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
    name = "orders",
    indexes = {
        @Index(name = "ix_orders_buyer", columnList = "buyerId"),
        @Index(name = "ux_order_bill", columnList = "billNumber", unique = true)
    }
)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 30)
    private String billNumber;

    @Column(nullable = false)
    private String buyerId;

    @Column(nullable = false, length = 150)
    private String buyerName;

    @Column(nullable = false, length = 20)
    private String buyerContact;

    @Column(nullable = false, length = 300)
    private String shippingAddress;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 10)
    private String pinCode;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus status = OrderStatus.PENDING_PAYMENT;

    private Instant paymentReportedAt;

    private Instant paymentVerifiedAt;

    @Column(length = 120)
    private String verifiedByAdmin;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Order() {}

    public Order(String billNumber, String buyerId, String buyerName, String buyerContact,
                 String shippingAddress, String city, String pinCode, BigDecimal totalAmount) {
        this.billNumber = billNumber;
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.buyerContact = buyerContact;
        this.shippingAddress = shippingAddress;
        this.city = city;
        this.pinCode = pinCode;
        this.totalAmount = totalAmount;
        this.status = OrderStatus.PENDING_PAYMENT;
        this.createdAt = Instant.now();
    }

    public void reportPayment() {
        if (this.status == OrderStatus.PAID) {
            throw new IllegalStateException("Order is already marked as PAID");
        }
        if (this.status == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot pay for a cancelled order");
        }
        this.status = OrderStatus.PAYMENT_REPORTED;
        this.paymentReportedAt = Instant.now();
    }

    public void markPaid(String adminEmail) {
        if (this.status == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot mark a cancelled order as PAID");
        }
        this.status = OrderStatus.PAID;
        this.paymentVerifiedAt = Instant.now();
        this.verifiedByAdmin = adminEmail;
    }

    public void cancel() {
        if (this.status == OrderStatus.PAID) {
            throw new IllegalStateException("Cannot cancel an order that is already PAID");
        }
        this.status = OrderStatus.CANCELLED;
    }

    public String getId() { return id; }
    public String getBillNumber() { return billNumber; }
    public String getBuyerId() { return buyerId; }
    public String getBuyerName() { return buyerName; }
    public String getBuyerContact() { return buyerContact; }
    public String getShippingAddress() { return shippingAddress; }
    public String getCity() { return city; }
    public String getPinCode() { return pinCode; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public OrderStatus getStatus() { return status; }
    public Instant getPaymentReportedAt() { return paymentReportedAt; }
    public Instant getPaymentVerifiedAt() { return paymentVerifiedAt; }
    public String getVerifiedByAdmin() { return verifiedByAdmin; }
    public Instant getCreatedAt() { return createdAt; }
}
