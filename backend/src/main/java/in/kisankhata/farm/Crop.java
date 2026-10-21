package in.kisankhata.farm;
import jakarta.persistence.*;import java.time.*;
@Entity @Table(indexes={@Index(name="ix_crop_owner",columnList="farmerId")})
public class Crop {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private String id;
 @Column(nullable=false) private String farmerId;
 @Column(nullable=false,length=120) private String name;
 @Column(length=80) private String category;
 private LocalDate plantationDate; private Integer durationDays;
 @Column(length=500) private String description;
 @Column(nullable=false,updatable=false) private Instant createdAt=Instant.now();
 protected Crop(){} public Crop(String owner,String name,String category,LocalDate date,Integer duration,String description){this.farmerId=owner;this.name=name.trim();this.category=category;this.plantationDate=date;this.durationDays=duration;this.description=description;}
 public void update(String name, String category, LocalDate date, Integer duration, String description) {
     this.name = name != null ? name.trim() : this.name;
     this.category = category;
     this.plantationDate = date;
     this.durationDays = duration;
     this.description = description;
 }
 public String getId(){return id;} public String getFarmerId(){return farmerId;} public String getName(){return name;} public String getCategory(){return category;} public LocalDate getPlantationDate(){return plantationDate;} public Integer getDurationDays(){return durationDays;} public String getDescription(){return description;} public Instant getCreatedAt(){return createdAt;}
}
