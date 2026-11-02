package in.kisankhata.user;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "app_users", indexes = {
    @Index(name = "ux_user_email", columnList = "email", unique = true),
    @Index(name = "ux_user_google_sub", columnList = "googleSub", unique = true)
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

    @Column(nullable = true, length = 20)
    private String mobile;

    @Column(nullable = true, length = 100)
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

    @Column(length = 100, unique = true)
    private String googleSub;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(length = 500)
    private String pictureUrl;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public AppUser() {}

    public AppUser(String firstName, String lastName, String email, String mobile, String passwordHash,
                   Role role, String farmName, String address, String state) {
        this(firstName, lastName, email, mobile, passwordHash, role, farmName, address, null, null, state);
    }

    public AppUser(String firstName, String lastName, String email, String mobile, String passwordHash,
                   Role role, String farmName, String address, String city, String pinCode, String state) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email != null ? email.toLowerCase().trim() : null;
        this.mobile = mobile;
        this.passwordHash = passwordHash;
        this.role = role;
        this.farmName = farmName;
        this.address = address;
        this.city = city;
        this.pinCode = pinCode;
        this.state = state;
        this.authProvider = AuthProvider.LOCAL;
        this.active = true;
        this.createdAt = Instant.now();
    }

    public boolean isProfileComplete() {
        if (role == Role.ADMIN) {
            return true;
        }
        if (mobile == null || !mobile.trim().matches("^[0-9]{10}$")) {
            return false;
        }
        if (role == Role.BUYER) {
            return address != null && !address.trim().isBlank()
                && city != null && !city.trim().isBlank()
                && pinCode != null && pinCode.trim().matches("^[0-9]{6}$");
        }
        return true;
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
    public String getGoogleSub() { return googleSub; }
    public AuthProvider getAuthProvider() { return authProvider; }
    public String getPictureUrl() { return pictureUrl; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }

    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setEmail(String email) { this.email = email != null ? email.toLowerCase().trim() : null; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setRole(Role role) { this.role = role; }
    public void setFarmName(String farmName) { this.farmName = farmName; }
    public void setAddress(String address) { this.address = address; }
    public void setCity(String city) { this.city = city; }
    public void setPinCode(String pinCode) { this.pinCode = pinCode; }
    public void setState(String state) { this.state = state; }
    public void setGoogleSub(String googleSub) { this.googleSub = googleSub; }
    public void setAuthProvider(AuthProvider authProvider) { this.authProvider = authProvider; }
    public void setPictureUrl(String pictureUrl) { this.pictureUrl = pictureUrl; }
    public void setActive(boolean active) { this.active = active; }
}
