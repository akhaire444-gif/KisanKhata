package in.kisankhata.farm;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "farm_records", indexes = @Index(name = "ix_record_owner_type_date", columnList = "farmerId,recordType,recordDate"))
public class FarmRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String farmerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecordType recordType;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(length = 100)
    private String plot;

    @Column(length = 120)
    private String product;

    @Column(length = 40)
    private String quantity;

    private Boolean fertilizerUsed;

    @Column(nullable = false)
    private LocalDate recordDate;

    private LocalDate reminderDate;

    private String reminderTime;

    @Column(nullable = false)
    private boolean done = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected FarmRecord() {}

    public FarmRecord(String owner, RecordType type, String name, String description, String plot,
                      String product, String quantity, Boolean fertilizerUsed, LocalDate date,
                      LocalDate reminderDate, String reminderTime) {
        this.farmerId = owner;
        this.recordType = type;
        this.name = name != null && !name.isBlank() ? name.trim() : (type != null ? type.name() : "RECORD");
        this.description = description;
        this.plot = plot;
        this.product = product;
        this.quantity = quantity;
        this.fertilizerUsed = fertilizerUsed;
        this.recordDate = date != null ? date : LocalDate.now();
        this.reminderDate = reminderDate;
        this.reminderTime = reminderTime;
        this.done = false;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getFarmerId() { return farmerId; }
    public RecordType getRecordType() { return recordType; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getPlot() { return plot; }
    public String getProduct() { return product; }
    public String getQuantity() { return quantity; }
    public Boolean getFertilizerUsed() { return fertilizerUsed; }
    public LocalDate getRecordDate() { return recordDate; }
    public LocalDate getReminderDate() { return reminderDate; }
    public String getReminderTime() { return reminderTime; }
    public boolean isDone() { return done; }
    public Instant getCreatedAt() { return createdAt; }

    public void setDone(boolean done) { this.done = done; }

    public enum RecordType {
        WATER, INPUT, REMINDER
    }
}
