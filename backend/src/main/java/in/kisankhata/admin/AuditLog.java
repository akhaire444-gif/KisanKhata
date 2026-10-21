package in.kisankhata.admin;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "audit_logs", indexes = @Index(name = "ix_audit_logs_timestamp", columnList = "timestamp"))
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 80)
    private String action;

    @Column(nullable = false, length = 120)
    private String performedBy;

    @Column(length = 100)
    private String targetId;

    @Column(length = 1000)
    private String details;

    @Column(length = 60)
    private String ipAddress;

    @Column(nullable = false, updatable = false)
    private Instant timestamp = Instant.now();

    protected AuditLog() {}

    public AuditLog(String action, String performedBy, String targetId, String details, String ipAddress) {
        this.action = action;
        this.performedBy = performedBy;
        this.targetId = targetId;
        this.details = details;
        this.ipAddress = ipAddress;
        this.timestamp = Instant.now();
    }

    public String getId() { return id; }
    public String getAction() { return action; }
    public String getPerformedBy() { return performedBy; }
    public String getTargetId() { return targetId; }
    public String getDetails() { return details; }
    public String getIpAddress() { return ipAddress; }
    public Instant getTimestamp() { return timestamp; }
}
