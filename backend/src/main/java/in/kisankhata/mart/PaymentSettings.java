package in.kisankhata.mart;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "payment_settings")
public class PaymentSettings {

    @Id
    @Column(length = 36)
    private String id = "DEFAULT";

    @Column(length = 100)
    private String upiId;

    @Column(length = 300)
    private String qrImageUrl;

    @Column(length = 20)
    private String shopContactNumber;

    @Column(length = 120)
    private String shopName;

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public PaymentSettings() {
        this.id = "DEFAULT";
        this.upiId = "kisankhata@upi";
        this.qrImageUrl = "";
        this.shopContactNumber = "9876543210";
        this.shopName = "KisanKhata Direct Mart";
        this.updatedAt = Instant.now();
    }

    public PaymentSettings(String upiId, String qrImageUrl, String shopContactNumber, String shopName) {
        this.id = "DEFAULT";
        this.upiId = upiId;
        this.qrImageUrl = qrImageUrl;
        this.shopContactNumber = shopContactNumber;
        this.shopName = shopName;
        this.updatedAt = Instant.now();
    }

    public void update(String upiId, String qrImageUrl, String shopContactNumber, String shopName) {
        this.upiId = upiId;
        this.qrImageUrl = qrImageUrl;
        this.shopContactNumber = shopContactNumber;
        this.shopName = shopName;
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public String getUpiId() { return upiId; }
    public String getQrImageUrl() { return qrImageUrl; }
    public String getShopContactNumber() { return shopContactNumber; }
    public String getShopName() { return shopName; }
    public Instant getUpdatedAt() { return updatedAt; }
}
