package in.kisankhata.auth;

import in.kisankhata.farm.DemoDataService;
import in.kisankhata.user.AppUser;
import in.kisankhata.user.Role;
import in.kisankhata.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

public class DemoAuthIntegrationTest {

    private SimpleUserRepository userRepo;
    private SimplePasswordEncoder encoder;
    private SimpleLoginAttemptService loginAttemptService;
    private SimpleDemoDataService demoDataService;
    private SimpleAuthConfiguration authConfig;
    private AuthController controller;

    @BeforeEach
    void setUp() throws Exception {
        userRepo = new SimpleUserRepository();
        encoder = new SimplePasswordEncoder();
        loginAttemptService = new SimpleLoginAttemptService();
        demoDataService = new SimpleDemoDataService(userRepo);
        authConfig = new SimpleAuthConfiguration(userRepo);
        controller = new AuthController(userRepo, encoder, authConfig, loginAttemptService, demoDataService);
    }

    @Test
    @DisplayName("Demo login establishes authenticated session without credentials and flags isDemo as true")
    void testDemoLoginFlow() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpSession session = new MockHttpSession();
        request.setSession(session);

        ResponseEntity<?> response = controller.demoLogin(request);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.get("success")).isEqualTo(true);

        AuthController.UserView view = (AuthController.UserView) body.get("data");
        assertThat(view).isNotNull();
        assertThat(view.email()).isEqualTo(DemoDataService.DEMO_EMAIL);
        assertThat(view.farmName()).isEqualTo(DemoDataService.DEMO_FARM_NAME);
        assertThat(view.role()).isEqualTo("FARMER");
        assertThat(view.isDemo()).isTrue();

        // Verify session was populated with SecurityContext
        SecurityContext secContext = (SecurityContext) session.getAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
        assertThat(secContext).isNotNull();
        assertThat(secContext.getAuthentication().getName()).isEqualTo(DemoDataService.DEMO_EMAIL);
        assertThat(secContext.getAuthentication().getAuthorities())
            .anyMatch(a -> a.getAuthority().equals("ROLE_FARMER"));
        assertThat(secContext.getAuthentication().getAuthorities())
            .noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        // Call /me endpoint with this authentication
        ResponseEntity<?> meResponse = controller.me(secContext.getAuthentication());
        assertThat(meResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        AuthController.UserView meView = (AuthController.UserView) ((Map<?, ?>) meResponse.getBody()).get("data");
        assertThat(meView.isDemo()).isTrue();
        assertThat(meView.farmName()).isEqualTo(DemoDataService.DEMO_FARM_NAME);
        assertThat(meView.role()).isEqualTo("FARMER");
    }

    @Test
    @DisplayName("Demo reset restores sample data and maintains session")
    void testDemoResetFlow() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpSession session = new MockHttpSession();
        request.setSession(session);

        ResponseEntity<?> response = controller.demoReset(request);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("success")).isEqualTo(true);
        assertThat(body.get("message")).isEqualTo("Demo data reset successfully");

        AuthController.UserView view = (AuthController.UserView) body.get("data");
        assertThat(view.isDemo()).isTrue();
        assertThat(view.role()).isEqualTo("FARMER");
        assertThat(demoDataService.resetCalled).isTrue();
    }

    @Test
    @DisplayName("Unauthenticated request to /me is rejected with 401")
    void testUnauthenticatedMe() {
        ResponseEntity<?> response = controller.me(null);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Normal farmer registration and login still works properly")
    void testNormalFarmerAuth() {
        AuthController.RegisterRequest regReq = new AuthController.RegisterRequest(
            "Ramesh", "Kadam", "ramesh@kisan.in", "9876543210",
            "ValidPass123", "Kadam Krishi Farm", "Nashik", "Maharashtra"
        );

        ResponseEntity<?> regRes = controller.register(regReq);
        assertThat(regRes.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        AuthController.UserView regView = (AuthController.UserView) ((Map<?, ?>) regRes.getBody()).get("data");
        assertThat(regView.isDemo()).isFalse();
        assertThat(regView.email()).isEqualTo("ramesh@kisan.in");

        // Login as real farmer
        MockHttpServletRequest req = new MockHttpServletRequest();
        ResponseEntity<?> loginRes = controller.login(new AuthController.LoginRequest("ramesh@kisan.in", "ValidPass123"), req);
        assertThat(loginRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        AuthController.UserView loginView = (AuthController.UserView) ((Map<?, ?>) loginRes.getBody()).get("data");
        assertThat(loginView.isDemo()).isFalse();
    }

    // Lightweight mock implementations for pure unit execution
    private static class SimpleUserRepository implements UserRepository {
        private final Map<String, AppUser> map = new HashMap<>();

        @Override public Optional<AppUser> findByEmailIgnoreCase(String email) {
            return map.values().stream().filter(u -> u.getEmail().equalsIgnoreCase(email)).findFirst();
        }
        @Override public boolean existsByEmailIgnoreCase(String email) {
            return map.values().stream().anyMatch(u -> u.getEmail().equalsIgnoreCase(email));
        }
        @Override public <S extends AppUser> S save(S entity) {
            if (entity.getId() == null) {
                try {
                    var f = AppUser.class.getDeclaredField("id");
                    f.setAccessible(true);
                    f.set(entity, UUID.randomUUID().toString());
                } catch (Exception ignored) {}
            }
            map.put(entity.getId(), entity);
            return entity;
        }
        @Override public <S extends AppUser> List<S> saveAll(Iterable<S> entities) { entities.forEach(this::save); return (List<S>) entities; }
        @Override public Optional<AppUser> findById(String s) { return Optional.ofNullable(map.get(s)); }
        @Override public boolean existsById(String s) { return map.containsKey(s); }
        @Override public List<AppUser> findAll() { return new ArrayList<>(map.values()); }
        @Override public List<AppUser> findAllById(Iterable<String> strings) { return Collections.emptyList(); }
        @Override public long count() { return map.size(); }
        @Override public void deleteById(String s) { map.remove(s); }
        @Override public void delete(AppUser entity) { map.remove(entity.getId()); }
        @Override public void deleteAllById(Iterable<? extends String> strings) {}
        @Override public void deleteAll(Iterable<? extends AppUser> entities) { entities.forEach(this::delete); }
        @Override public void deleteAll() { map.clear(); }
        @Override public void flush() {}
        @Override public <S extends AppUser> S saveAndFlush(S entity) { return save(entity); }
        @Override public <S extends AppUser> List<S> saveAllAndFlush(Iterable<S> entities) { return saveAll(entities); }
        @Override public void deleteAllInBatch(Iterable<AppUser> entities) {}
        @Override public void deleteAllByIdInBatch(Iterable<String> strings) {}
        @Override public void deleteAllInBatch() {}
        @Override public AppUser getOne(String s) { return map.get(s); }
        @Override public AppUser getById(String s) { return map.get(s); }
        @Override public AppUser getReferenceById(String s) { return map.get(s); }
        @Override public <S extends AppUser> Optional<S> findOne(org.springframework.data.domain.Example<S> example) { return Optional.empty(); }
        @Override public <S extends AppUser> List<S> findAll(org.springframework.data.domain.Example<S> example) { return Collections.emptyList(); }
        @Override public <S extends AppUser> List<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Sort sort) { return Collections.emptyList(); }
        @Override public <S extends AppUser> org.springframework.data.domain.Page<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public <S extends AppUser> long count(org.springframework.data.domain.Example<S> example) { return 0; }
        @Override public <S extends AppUser> boolean exists(org.springframework.data.domain.Example<S> example) { return false; }
        @Override public <S extends AppUser, R> R findBy(org.springframework.data.domain.Example<S> example, java.util.function.Function<org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public List<AppUser> findAll(org.springframework.data.domain.Sort sort) { return findAll(); }
        @Override public org.springframework.data.domain.Page<AppUser> findAll(org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
    }

    private static class SimplePasswordEncoder implements PasswordEncoder {
        @Override public String encode(CharSequence rawPassword) { return "enc_" + rawPassword; }
        @Override public boolean matches(CharSequence rawPassword, String encodedPassword) {
            return encodedPassword.equals("enc_" + rawPassword);
        }
    }

    private static class SimpleLoginAttemptService extends LoginAttemptService {
        @Override public boolean isBlocked(String key) { return false; }
        @Override public void loginSucceeded(String key) {}
        @Override public void loginFailed(String key) {}
    }

    private static class SimpleDemoDataService extends DemoDataService {
        private final UserRepository userRepo;
        boolean resetCalled = false;

        public SimpleDemoDataService(UserRepository userRepo) {
            super(userRepo, null, null, null, null, new SimplePasswordEncoder());
            this.userRepo = userRepo;
        }

        @Override
        public AppUser ensureDemoDataInitialized() {
            return userRepo.findByEmailIgnoreCase(DEMO_EMAIL).orElseGet(() -> userRepo.save(new AppUser(
                DEMO_FIRST_NAME, DEMO_LAST_NAME, DEMO_EMAIL, DEMO_MOBILE, "pass",
                Role.FARMER, DEMO_FARM_NAME, DEMO_ADDRESS, DEMO_CITY, DEMO_PIN_CODE, DEMO_STATE
            )));
        }

        @Override
        public AppUser resetDemoData() {
            resetCalled = true;
            return ensureDemoDataInitialized();
        }
    }

    private static class SimpleAuthConfiguration extends AuthenticationConfiguration {
        private final UserRepository userRepo;

        public SimpleAuthConfiguration(UserRepository userRepo) {
            this.userRepo = userRepo;
        }

        @Override
        public AuthenticationManager getAuthenticationManager() {
            return authentication -> {
                String email = authentication.getName();
                String pass = (String) authentication.getCredentials();
                AppUser u = userRepo.findByEmailIgnoreCase(email).orElse(null);
                if (u != null && u.getPasswordHash().equals("enc_" + pass)) {
                    return new UsernamePasswordAuthenticationToken(email, pass, List.of(() -> "ROLE_" + u.getRole().name()));
                }
                throw new BadCredentialsException("Invalid credentials");
            };
        }
    }
}
