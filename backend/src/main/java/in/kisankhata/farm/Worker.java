package in.kisankhata.farm;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Entity
@Table(name = "workers", indexes = @Index(name = "ix_worker_owner", columnList = "farmerId"))
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String farmerId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    private int daysWorked;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyWage;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal paymentAmount;

    @Column(length = 20)
    private String contact;

    @Column(length = 254)
    private String email;

    @Column(length = 240)
    private String address;

    @Column(length = 100)
    private String upiId;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Worker() {}

    public Worker(String owner, String name, int days, BigDecimal wage, String contact, String email, String address, String upiId) {
        this.farmerId = owner;
        this.name = name != null ? name.trim() : "";
        this.daysWorked = days;
        this.dailyWage = wage != null ? wage : BigDecimal.ZERO;
        this.paymentAmount = this.dailyWage.multiply(BigDecimal.valueOf(days)).setScale(2, RoundingMode.HALF_UP);
        this.contact = contact;
        this.email = email;
        this.address = address;
        this.upiId = upiId;
        this.createdAt = Instant.now();
    }

    public void update(String name, int days, BigDecimal wage, String contact, String email, String address, String upiId) {
        this.name = name != null ? name.trim() : this.name;
        this.daysWorked = days;
        this.dailyWage = wage != null ? wage : BigDecimal.ZERO;
        this.paymentAmount = this.dailyWage.multiply(BigDecimal.valueOf(days)).setScale(2, RoundingMode.HALF_UP);
        this.contact = contact;
        this.email = email;
        this.address = address;
        this.upiId = upiId;
    }

    public String getId() { return id; }
    public String getFarmerId() { return farmerId; }
    public String getName() { return name; }
    public int getDaysWorked() { return daysWorked; }
    public BigDecimal getDailyWage() { return dailyWage; }
    public BigDecimal getPaymentAmount() { return paymentAmount; }
    public String getContact() { return contact; }
    public String getEmail() { return email; }
    public String getAddress() { return address; }
    public String getUpiId() { return upiId; }
    public Instant getCreatedAt() { return createdAt; }
}
