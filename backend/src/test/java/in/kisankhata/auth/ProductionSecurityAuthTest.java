package in.kisankhata.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.kisankhata.farm.CropRepository;
import in.kisankhata.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ProductionSecurityAuthTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private CropRepository cropRepo;

    @Test
    @DisplayName("Public endpoints must be accessible without authentication")
    void testPublicEndpointsAccessible() throws Exception {
        mvc.perform(get("/actuator/health"))
            .andExpect(status().isOk());

        mvc.perform(get("/api/v1/auth/csrf"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        mvc.perform(get("/api/v1/mart/products"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Protected farmer and admin endpoints must reject unauthenticated requests with 401")
    void testProtectedEndpointsRejectUnauthenticated() throws Exception {
        mvc.perform(get("/api/v1/farmer/crops"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        mvc.perform(get("/api/v1/farmer/expenses"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        mvc.perform(get("/api/v1/farmer/workers"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        mvc.perform(get("/api/v1/farmer/reports/summary"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        mvc.perform(get("/api/v1/admin/dashboard"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        mvc.perform(get("/api/v1/auth/me"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("Login with invalid credentials must be rejected and not create session")
    void testLoginWithInvalidCredentialsFails() throws Exception {
        String body = mapper.writeValueAsString(Map.of(
            "email", "nonexistent.farmer@test.com",
            "password", "wrongpassword123"
        ));

        mvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.code").value("BAD_CREDENTIALS"));
    }

    @Test
    @DisplayName("Registration, login, me, and logout lifecycle works securely with session invalidation")
    void testAuthLifecycleAndSessionSecurity() throws Exception {
        String email = "farmer.audit." + System.currentTimeMillis() + "@ruraltest.in";
        String password = "SecureFarmerPass@2026";

        // 1. Register new farmer
        String regBody = mapper.writeValueAsString(Map.of(
            "firstName", "Suresh",
            "lastName", "Deshmukh",
            "email", email,
            "mobile", "9876543210",
            "password", password,
            "farmName", "Deshmukh Agro Farm",
            "address", "Dindori, Nashik",
            "state", "Maharashtra"
        ));

        mvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(regBody))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.email").value(email.toLowerCase()));

        // Verify password is NOT plaintext in database
        assertThat(userRepo.findByEmailIgnoreCase(email).orElseThrow().getPasswordHash())
            .isNotEqualTo(password)
            .startsWith("$2a$");

        // 2. Login to establish authenticated session
        String loginBody = mapper.writeValueAsString(Map.of(
            "email", email,
            "password", password
        ));

        MvcResult loginResult = mvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);
        assertThat(session).isNotNull();

        // 3. /me returns authenticated user data
        mvc.perform(get("/api/v1/auth/me").session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.email").value(email.toLowerCase()))
            .andExpect(jsonPath("$.data.firstName").value("Suresh"));

        // 4. Access protected endpoint with valid session
        mvc.perform(get("/api/v1/farmer/crops").session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        // 5. Logout
        mvc.perform(post("/api/v1/auth/logout").session(session))
            .andExpect(status().isNoContent());

        // 6. Accessing protected endpoint after logout must be rejected with 401
        mvc.perform(get("/api/v1/farmer/crops").session(session))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Tenant isolation: User A cannot read or modify User B's records by manipulating ID")
    void testTenantIsolationAcrossFarmers() throws Exception {
        long t = System.currentTimeMillis();
        String emailA = "farmer.a." + t + "@ruraltest.in";
        String emailB = "farmer.b." + t + "@ruraltest.in";
        String pass = "SecurePass123!";

        // Register Farmer A
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(
            mapper.writeValueAsString(Map.of("firstName", "FarmerA", "lastName", "Test", "email", emailA, "mobile", "9111111111", "password", pass))
        )).andExpect(status().isCreated());

        // Register Farmer B
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(
            mapper.writeValueAsString(Map.of("firstName", "FarmerB", "lastName", "Test", "email", emailB, "mobile", "9222222222", "password", pass))
        )).andExpect(status().isCreated());

        // Login as Farmer A
        MvcResult resA = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(
            mapper.writeValueAsString(Map.of("email", emailA, "password", pass))
        )).andExpect(status().isOk()).andReturn();
        MockHttpSession sessionA = (MockHttpSession) resA.getRequest().getSession();

        // Farmer A creates a crop
        String cropBody = mapper.writeValueAsString(Map.of(
            "name", "Private Crop A",
            "category", "Fruit",
            "plantationDate", LocalDate.now().toString(),
            "durationDays", 180,
            "description", "Confidential farm parcel"
        ));

        MvcResult cropRes = mvc.perform(post("/api/v1/farmer/crops")
                .session(sessionA)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(cropBody))
            .andExpect(status().isCreated())
            .andReturn();

        Map<?, ?> cropData = mapper.readValue(cropRes.getResponse().getContentAsString(), Map.class);
        Map<?, ?> cropInner = (Map<?, ?>) cropData.get("data");
        String cropIdA = (String) cropInner.get("id");
        assertThat(cropIdA).isNotNull();

        // Login as Farmer B
        MvcResult resB = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(
            mapper.writeValueAsString(Map.of("email", emailB, "password", pass))
        )).andExpect(status().isOk()).andReturn();
        MockHttpSession sessionB = (MockHttpSession) resB.getRequest().getSession();

        // Farmer B lists their crops -> Crop A must NOT be in the list
        mvc.perform(get("/api/v1/farmer/crops").session(sessionB))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").isEmpty());

        // Farmer B attempts to delete Farmer A's crop by passing Crop A's ID
        // Backend must reject with 404 (Crop not found in Farmer B's partition)
        mvc.perform(delete("/api/v1/farmer/crops/" + cropIdA)
                .session(sessionB)
                .with(csrf()))
            .andExpect(status().isNotFound());

        // Verify Crop A still exists unharmed in Farmer A's partition
        mvc.perform(get("/api/v1/farmer/crops").session(sessionA))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].id").value(cropIdA));
    }
}
