package in.kisankhata.mart;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, length = 80)
    private String category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private int stockQuantity = 0;

    @Column(length = 300)
    private String imageUrl;

    @Column(nullable = false)
    private boolean active = true;

    @Version
    private Long version;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    protected Product() {}

    public Product(String name, String description, String category, BigDecimal price, int stockQuantity, String imageUrl) {
        this.name = name != null ? name.trim() : "";
        this.description = description;
        this.category = category != null ? category.trim() : "General";
        this.price = price != null ? price : BigDecimal.ZERO;
        this.stockQuantity = Math.max(0, stockQuantity);
        this.imageUrl = imageUrl;
        this.active = true;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void update(String name, String description, String category, BigDecimal price, int stockQuantity, String imageUrl, Boolean active) {
        if (name != null) this.name = name.trim();
        if (description != null) this.description = description;
        if (category != null) this.category = category.trim();
        if (price != null) this.price = price;
        this.stockQuantity = Math.max(0, stockQuantity);
        if (imageUrl != null) this.imageUrl = imageUrl;
        if (active != null) this.active = active;
        this.updatedAt = Instant.now();
    }

    public void deductStock(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity to deduct must be positive");
        }
        if (this.stockQuantity < quantity) {
            throw new IllegalStateException("Insufficient stock for product: " + this.name);
        }
        this.stockQuantity -= quantity;
        this.updatedAt = Instant.now();
    }

    public void restoreStock(int quantity) {
        if (quantity > 0) {
            this.stockQuantity += quantity;
            this.updatedAt = Instant.now();
        }
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public BigDecimal getPrice() { return price; }
    public int getStockQuantity() { return stockQuantity; }
    public String getImageUrl() { return imageUrl; }
    public boolean isActive() { return active; }
    public Long getVersion() { return version; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setActive(boolean active) {
        this.active = active;
        this.updatedAt = Instant.now();
    }
}
