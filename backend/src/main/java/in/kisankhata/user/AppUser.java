package in.kisankhata.user;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "app_users", indexes = {
    @Index(name = "ux_user_email", columnList = "email", unique = true)
})
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 120)
    private String firstName;

    @Column(nullable = false, length = 120)
    private String lastName;

    @Column(nullable = false, length = 254, unique = true)
    private String email;

    @Column(nullable = false, length = 20)
    private String mobile;

    @Column(nullable = false, length = 100)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.FARMER;

    @Column(length = 180)
    private String farmName;

    @Column(length = 300)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 10)
    private String pinCode;

    @Column(length = 100)
    private String state = "Maharashtra";

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected AppUser() {}

    public AppUser(String firstName, String lastName, String email, String mobile, String passwordHash,
                   Role role, String farmName, String address, String state) {
        this(firstName, lastName, email, mobile, passwordHash, role, farmName, address, null, null, state);
    }

    public AppUser(String firstName, String lastName, String email, String mobile, String passwordHash,
                   Role role, String farmName, String address, String city, String pinCode, String state) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email.toLowerCase().trim();
        this.mobile = mobile;
        this.passwordHash = passwordHash;
        this.role = role;
        this.farmName = farmName;
        this.address = address;
        this.city = city;
        this.pinCode = pinCode;
        this.state = state;
        this.active = true;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getMobile() { return mobile; }
    public String getPasswordHash() { return passwordHash; }
    public Role getRole() { return role; }
    public String getFarmName() { return farmName; }
    public String getAddress() { return address; }
    public String getCity() { return city; }
    public String getPinCode() { return pinCode; }
    public String getState() { return state; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }

    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setRole(Role role) { this.role = role; }
    public void setFarmName(String farmName) { this.farmName = farmName; }
    public void setAddress(String address) { this.address = address; }
    public void setCity(String city) { this.city = city; }
    public void setPinCode(String pinCode) { this.pinCode = pinCode; }
    public void setState(String state) { this.state = state; }
    public void setActive(boolean active) { this.active = active; }
}
