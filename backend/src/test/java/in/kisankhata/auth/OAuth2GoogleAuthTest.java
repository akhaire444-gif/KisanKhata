package in.kisankhata.auth;

import in.kisankhata.config.DemoCleanupRunner;
import in.kisankhata.user.AppUser;
import in.kisankhata.user.AuthProvider;
import in.kisankhata.user.Role;
import in.kisankhata.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class OAuth2GoogleAuthTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private OAuth2SuccessHandler successHandler;

    @Autowired
    private OAuth2FailureHandler failureHandler;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private DemoCleanupRunner demoCleanupRunner;

    @Test
    @DisplayName("New Google user signs up as FARMER by default, creates user record and establishes session")
    void testGoogleSignUpNewFarmer() throws Exception {
        String email = "google.farmer." + System.currentTimeMillis() + "@gmail.com";
        Map<String, Object> attrs = new HashMap<>();
        attrs.put("sub", "sub-" + System.currentTimeMillis());
        attrs.put("email", email);
        attrs.put("email_verified", true);
        attrs.put("given_name", "Ganesh");
        attrs.put("family_name", "Kadam");
        attrs.put("name", "Ganesh Kadam");
        attrs.put("picture", "https://example.com/ganesh.jpg");

        DefaultOAuth2User principal = new DefaultOAuth2User(
            List.of(new SimpleGrantedAuthority("ROLE_USER")),
            attrs,
            "sub"
        );
        OAuth2AuthenticationToken token = new OAuth2AuthenticationToken(
            principal,
            List.of(new SimpleGrantedAuthority("ROLE_USER")),
            "google"
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockHttpSession session = (MockHttpSession) request.getSession(true);

        successHandler.onAuthenticationSuccess(request, response, token);

        // Verification of redirect and incomplete profile (mobile empty)
        assertThat(response.getRedirectedUrl()).contains("/?auth=success&profile=incomplete");

        // Verification of database state
        AppUser created = userRepo.findByEmailIgnoreCase(email).orElse(null);
        assertThat(created).isNotNull();
        assertThat(created.getFirstName()).isEqualTo("Ganesh");
        assertThat(created.getLastName()).isEqualTo("Kadam");
        assertThat(created.getRole()).isEqualTo(Role.FARMER);
        assertThat(created.getAuthProvider()).isEqualTo(AuthProvider.GOOGLE);
        assertThat(created.getPasswordHash()).isNull();
        assertThat(created.getGoogleSub()).isEqualTo(attrs.get("sub"));
        assertThat(created.getPictureUrl()).isEqualTo(attrs.get("picture"));

        // Verification of established session
        SecurityContext secContext = (SecurityContext) session.getAttribute(
            HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY
        );
        assertThat(secContext).isNotNull();
        assertThat(secContext.getAuthentication().getName()).isEqualTo(email.toLowerCase());
        assertThat(secContext.getAuthentication().getAuthorities())
            .extracting("authority")
            .contains("ROLE_FARMER");
    }

    @Test
    @DisplayName("New Google user can register as BUYER when requested in session")
    void testGoogleSignUpNewBuyer() throws Exception {
        String email = "google.buyer." + System.currentTimeMillis() + "@gmail.com";
        Map<String, Object> attrs = new HashMap<>();
        attrs.put("sub", "buyer-sub-" + System.currentTimeMillis());
        attrs.put("email", email);
        attrs.put("email_verified", true);
        attrs.put("given_name", "Ravi");
        attrs.put("family_name", "Varma");
        attrs.put("name", "Ravi Varma");

        DefaultOAuth2User principal = new DefaultOAuth2User(
            List.of(new SimpleGrantedAuthority("ROLE_USER")),
            attrs,
            "sub"
        );
        OAuth2AuthenticationToken token = new OAuth2AuthenticationToken(
            principal,
            List.of(new SimpleGrantedAuthority("ROLE_USER")),
            "google"
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockHttpSession session = (MockHttpSession) request.getSession(true);
        session.setAttribute("oauth2_auth_role", "BUYER");

        successHandler.onAuthenticationSuccess(request, response, token);

        AppUser created = userRepo.findByEmailIgnoreCase(email).orElse(null);
        assertThat(created).isNotNull();
        assertThat(created.getRole()).isEqualTo(Role.BUYER);
    }

    @Test
    @DisplayName("Role escalation attempt to ADMIN via session is ignored and defaults to FARMER")
    void testRoleEscalationToAdminIgnored() throws Exception {
        String email = "escalation.test." + System.currentTimeMillis() + "@gmail.com";
        Map<String, Object> attrs = new HashMap<>();
        attrs.put("sub", "esc-sub-" + System.currentTimeMillis());
        attrs.put("email", email);
        attrs.put("email_verified", true);
        attrs.put("name", "Malicious Actor");

        DefaultOAuth2User principal = new DefaultOAuth2User(
            List.of(new SimpleGrantedAuthority("ROLE_USER")),
            attrs,
            "sub"
        );
        OAuth2AuthenticationToken token = new OAuth2AuthenticationToken(
            principal,
            List.of(new SimpleGrantedAuthority("ROLE_USER")),
            "google"
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockHttpSession session = (MockHttpSession) request.getSession(true);
        session.setAttribute("oauth2_auth_role", "ADMIN");

        successHandler.onAuthenticationSuccess(request, response, token);

        AppUser created = userRepo.findByEmailIgnoreCase(email).orElse(null);
        assertThat(created).isNotNull();
        assertThat(created.getRole()).isEqualTo(Role.FARMER);
    }

    @Test
    @DisplayName("Existing email account is linked with Google without changing original role")
    void testExistingUserLinkedWithoutChangingRole() throws Exception {
        String email = "existing.buyer." + System.currentTimeMillis() + "@test.in";
        AppUser existingUser = new AppUser(
            "Pooja", "Jadhav", email, "9876543210", "$2a$12$dummyhashforlinkingtest",
            Role.BUYER, null, "Pune Central", "Pune", "411001", "Maharashtra"
        );
        userRepo.save(existingUser);

        Map<String, Object> attrs = new HashMap<>();
        attrs.put("sub", "existing-sub-" + System.currentTimeMillis());
        attrs.put("email", email);
        attrs.put("email_verified", true);
        attrs.put("given_name", "Pooja");
        attrs.put("family_name", "Jadhav");
        attrs.put("picture", "https://example.com/pooja.jpg");

        DefaultOAuth2User principal = new DefaultOAuth2User(
            List.of(new SimpleGrantedAuthority("ROLE_USER")),
            attrs,
            "sub"
        );
        OAuth2AuthenticationToken token = new OAuth2AuthenticationToken(
            principal,
            List.of(new SimpleGrantedAuthority("ROLE_USER")),
            "google"
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.getSession(true);

        successHandler.onAuthenticationSuccess(request, response, token);

        // Profile is complete, redirect to /?auth=success
        assertThat(response.getRedirectedUrl()).isEqualTo("http://localhost:3000/?auth=success");

        AppUser updated = userRepo.findByEmailIgnoreCase(email).orElseThrow();
        assertThat(updated.getRole()).isEqualTo(Role.BUYER); // Untouched role
        assertThat(updated.getGoogleSub()).isEqualTo(attrs.get("sub"));
        assertThat(updated.getPictureUrl()).isEqualTo(attrs.get("picture"));
    }

    @Test
    @DisplayName("Unverified Google email is rejected with EMAIL_NOT_VERIFIED error redirect")
    void testUnverifiedEmailRejected() throws Exception {
        String email = "unverified." + System.currentTimeMillis() + "@gmail.com";
        Map<String, Object> attrs = new HashMap<>();
        attrs.put("sub", "unverified-sub");
        attrs.put("email", email);
        attrs.put("email_verified", false);

        DefaultOAuth2User principal = new DefaultOAuth2User(
            List.of(new SimpleGrantedAuthority("ROLE_USER")),
            attrs,
            "sub"
        );
        OAuth2AuthenticationToken token = new OAuth2AuthenticationToken(
            principal,
            List.of(new SimpleGrantedAuthority("ROLE_USER")),
            "google"
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        successHandler.onAuthenticationSuccess(request, response, token);

        assertThat(response.getRedirectedUrl()).contains("/?auth=error&code=EMAIL_NOT_VERIFIED");
        assertThat(userRepo.findByEmailIgnoreCase(email)).isEmpty();
    }

    @Test
    @DisplayName("Disabled user account is rejected with ACCOUNT_DISABLED error redirect")
    void testDisabledAccountRejected() throws Exception {
        String email = "disabled." + System.currentTimeMillis() + "@test.in";
        AppUser disabledUser = new AppUser(
            "Inactive", "User", email, "9876543210", "$2a$12$dummy",
            Role.FARMER, "Inactive Farm", "Nashik", "Maharashtra"
        );
        disabledUser.setActive(false);
        userRepo.save(disabledUser);

        Map<String, Object> attrs = new HashMap<>();
        attrs.put("sub", "disabled-sub");
        attrs.put("email", email);
        attrs.put("email_verified", true);

        DefaultOAuth2User principal = new DefaultOAuth2User(
            List.of(new SimpleGrantedAuthority("ROLE_USER")),
            attrs,
            "sub"
        );
        OAuth2AuthenticationToken token = new OAuth2AuthenticationToken(
            principal,
            List.of(new SimpleGrantedAuthority("ROLE_USER")),
            "google"
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        successHandler.onAuthenticationSuccess(request, response, token);

        assertThat(response.getRedirectedUrl()).contains("/?auth=error&code=ACCOUNT_DISABLED");
    }

    @Test
    @DisplayName("Google-only account attempting email+password login returns clean 401 BAD_CREDENTIALS (never 500)")
    void testGoogleOnlyAccountPasswordLoginReturnsClean401() throws Exception {
        String email = "google.only." + System.currentTimeMillis() + "@gmail.com";
        AppUser googleUser = new AppUser();
        googleUser.setFirstName("GoogleOnly");
        googleUser.setLastName("User");
        googleUser.setEmail(email);
        googleUser.setRole(Role.FARMER);
        googleUser.setAuthProvider(AuthProvider.GOOGLE);
        googleUser.setPasswordHash(null); // Null password hash
        googleUser.setActive(true);
        userRepo.save(googleUser);

        String loginJson = "{\"email\":\"" + email + "\",\"password\":\"somepassword123\"}";

        mvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.code").value("BAD_CREDENTIALS"));
    }

    @Test
    @DisplayName("PUT /api/v1/auth/profile updates profile and validates mobile and pin format")
    void testProfileUpdateAndValidation() throws Exception {
        String email = "profile.test." + System.currentTimeMillis() + "@rural.in";
        AppUser user = new AppUser();
        user.setFirstName("Pravin");
        user.setLastName("Koli");
        user.setEmail(email);
        user.setRole(Role.FARMER);
        user.setMobile("");
        user.setActive(true);
        userRepo.save(user);

        // Create authenticated session
        MockHttpSession session = new MockHttpSession();
        SecurityContext context = org.springframework.security.core.context.SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
            email, null, List.of(new SimpleGrantedAuthority("ROLE_FARMER"))
        ));
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        // 1. Invalid mobile (less than 10 digits)
        mvc.perform(put("/api/v1/auth/profile")
                .session(session)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"mobile\":\"12345\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_MOBILE"));

        // 2. Valid profile update
        mvc.perform(put("/api/v1/auth/profile")
                .session(session)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"mobile\":\"9822334455\",\"farmName\":\"Koli Krishi Farm\",\"city\":\"Nashik\",\"pinCode\":\"422003\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.mobile").value("9822334455"))
            .andExpect(jsonPath("$.data.farmName").value("Koli Krishi Farm"))
            .andExpect(jsonPath("$.data.profileComplete").value(true));

        // 3. /me reflects the updated profile
        mvc.perform(get("/api/v1/auth/me").session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.profileComplete").value(true))
            .andExpect(jsonPath("$.data.mobile").value("9822334455"));
    }

    @Test
    @DisplayName("Demo cleanup runner deletes demo.farmer@kisankhata.in if present")
    void testDemoCleanupDeletesDemoUser() {
        String demoEmail = "demo.farmer@kisankhata.in";
        userRepo.findByEmailIgnoreCase(demoEmail).ifPresent(userRepo::delete);

        AppUser demo = new AppUser(
            "Demo", "Farmer", demoEmail, "9876543210", "$2a$12$dummy",
            Role.FARMER, "Demo Farm", "Nashik", "Maharashtra"
        );
        userRepo.save(demo);
        assertThat(userRepo.findByEmailIgnoreCase(demoEmail)).isPresent();

        demoCleanupRunner.run();

        assertThat(userRepo.findByEmailIgnoreCase(demoEmail)).isEmpty();
    }
}

