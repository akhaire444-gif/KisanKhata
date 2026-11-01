
package in.kisankhata.mart;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items", indexes = @Index(name = "ix_order_items_order", columnList = "orderId"))
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String orderId;

    @Column(nullable = false)
    private String productId;

    @Column(nullable = false, length = 150)
    private String productName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal lineTotal;

    protected OrderItem() {}

    public OrderItem(String orderId, String productId, String productName, BigDecimal unitPrice, int quantity) {
        this.orderId = orderId;
        this.productId = productId;
        this.productName = productName != null ? productName.trim() : "";
        this.unitPrice = unitPrice != null ? unitPrice : BigDecimal.ZERO;
        this.quantity = Math.max(1, quantity);
        this.lineTotal = this.unitPrice.multiply(BigDecimal.valueOf(this.quantity));
    }

    public String getId() { return id; }
    public String getOrderId() { return orderId; }
    public String getProductId() { return productId; }
    public String getProductName() { return productName; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public int getQuantity() { return quantity; }
    public BigDecimal getLineTotal() { return lineTotal; }
}
