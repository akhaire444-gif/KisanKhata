package in.kisankhata.farm;
import jakarta.persistence.*;import java.math.BigDecimal;import java.time.*;
@Entity @Table(indexes={@Index(name="ix_expense_owner_date",columnList="farmerId,expenseDate")})
public class Expense {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private String id;
 @Column(nullable=false) private String farmerId; @Column(nullable=false) private String cropId;
 @Column(nullable=false,precision=12,scale=2) private BigDecimal amount;
 @Column(nullable=false,length=80) private String category; @Column(length=500) private String details;
 @Column(nullable=false) private LocalDate expenseDate; @Column(nullable=false,updatable=false) private Instant createdAt=Instant.now();
 protected Expense(){} public Expense(String owner,String cropId,BigDecimal amount,String category,String details,LocalDate date){this.farmerId=owner;this.cropId=cropId;this.amount=amount;this.category=category;this.details=details;this.expenseDate=date;}
 public void update(String cropId, BigDecimal amount, String category, String details, LocalDate date) {
     this.cropId = cropId;
     this.amount = amount;
     this.category = category;
     this.details = details;
     this.expenseDate = date;
 }
 public String getId(){return id;}public String getFarmerId(){return farmerId;}public String getCropId(){return cropId;}public BigDecimal getAmount(){return amount;}public String getCategory(){return category;}public String getDetails(){return details;}public LocalDate getExpenseDate(){return expenseDate;}public Instant getCreatedAt(){return createdAt;}
}
