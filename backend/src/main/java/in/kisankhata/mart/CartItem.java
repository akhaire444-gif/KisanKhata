package in.kisankhata.mart;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

@Entity
@Table(
    name = "cart_items",
    indexes = @Index(name = "ix_cart_buyer", columnList = "buyerId"),
    uniqueConstraints = @UniqueConstraint(name = "ux_cart_buyer_product", columnNames = {"buyerId", "productId"})
)
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String buyerId;

    @Column(nullable = false)
    private String productId;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected CartItem() {}

    public CartItem(String buyerId, String productId, int quantity) {
        this.buyerId = buyerId;
        this.productId = productId;
        this.quantity = Math.max(1, quantity);
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getBuyerId() { return buyerId; }
    public String getProductId() { return productId; }
    public int getQuantity() { return quantity; }
    public Instant getCreatedAt() { return createdAt; }

    public void setQuantity(int quantity) {
        this.quantity = Math.max(1, quantity);
    }
}
