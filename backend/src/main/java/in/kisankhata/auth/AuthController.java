package in.kisankhata.auth;

import in.kisankhata.user.AppUser;
import in.kisankhata.user.Role;
import in.kisankhata.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager manager;
    private final LoginAttemptService loginAttemptService;

    public AuthController(
        UserRepository users,
        PasswordEncoder encoder,
        org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration cfg,
        LoginAttemptService loginAttemptService
    ) throws Exception {
        this.users = users;
        this.encoder = encoder;
        this.manager = cfg.getAuthenticationManager();
        this.loginAttemptService = loginAttemptService;
    }

    public record RegisterRequest(
        @NotBlank @Size(max = 120) String firstName,
        @NotBlank @Size(max = 120) String lastName,
        @Email @NotBlank String email,
        @Pattern(regexp = "^[0-9]{10}$") String mobile,
        @NotBlank @Size(min = 6, max = 72) String password,
        @Size(max = 180) String farmName,
        @Size(max = 240) String address,
        @Size(max = 100) String state
    ) {}

    public record RegisterBuyerRequest(
        @NotBlank @Size(max = 120) String firstName,
        @NotBlank @Size(max = 120) String lastName,
        @Email @NotBlank String email,
        @Pattern(regexp = "^[0-9]{10}$") String mobile,
        @NotBlank @Size(min = 6, max = 72) String password,
        @NotBlank @Size(max = 300) String address,
        @NotBlank @Size(max = 100) String city,
        @NotBlank @Pattern(regexp = "^[0-9]{6}$") String pinCode
    ) {}

    public record LoginRequest(
        @Email @NotBlank String email,
        @NotBlank String password
    ) {}

    public record UserView(
        String id,
        String firstName,
        String lastName,
        String email,
        String mobile,
        String role,
        String farmName,
        String address,
        String city,
        String pinCode,
        String state
    ) {}

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest r) {
        if (users.existsByEmailIgnoreCase(r.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "success", false,
                "code", "EMAIL_EXISTS",
                "message", "An account with this email already exists"
            ));
        }
        AppUser u = users.save(new AppUser(
            r.firstName().trim(),
            r.lastName().trim(),
            r.email(),
            r.mobile(),
            encoder.encode(r.password()),
            Role.FARMER,
            blankDefault(r.farmName(), r.firstName() + " Krishi Farm"),
            blankDefault(r.address(), "Nashik Rural"),
            blankDefault(r.state(), "Maharashtra")
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", view(u)));
    }

    @PostMapping("/register-buyer")
    public ResponseEntity<?> registerBuyer(@Valid @RequestBody RegisterBuyerRequest r) {
        if (users.existsByEmailIgnoreCase(r.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "success", false,
                "code", "EMAIL_EXISTS",
                "message", "An account with this email already exists"
            ));
        }
        AppUser u = users.save(new AppUser(
            r.firstName().trim(),
            r.lastName().trim(),
            r.email(),
            r.mobile(),
            encoder.encode(r.password()),
            Role.BUYER,
            null,
            r.address().trim(),
            r.city().trim(),
            r.pinCode().trim(),
            "Maharashtra"
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", view(u)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest r, HttpServletRequest request) {
        String email = r.email().toLowerCase().trim();

        if (loginAttemptService.isBlocked(email)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of(
                "success", false,
                "code", "TOO_MANY_REQUESTS",
                "message", "Too many failed login attempts. Please try again in 10 minutes."
            ));
        }

        try {
            Authentication auth = manager.authenticate(new UsernamePasswordAuthenticationToken(email, r.password()));
            loginAttemptService.loginSucceeded(email);

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);
            request.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

            AppUser u = users.findByEmailIgnoreCase(email).orElseThrow();
            return ResponseEntity.ok(Map.of("success", true, "data", view(u)));
        } catch (BadCredentialsException ex) {
            loginAttemptService.loginFailed(email);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "code", "BAD_CREDENTIALS",
                "message", "Invalid email or password"
            ));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "code", "UNAUTHORIZED",
                "message", "Not authenticated"
            ));
        }
        AppUser u = users.findByEmailIgnoreCase(auth.getName()).orElseThrow();
        return ResponseEntity.ok(Map.of("success", true, "data", view(u)));
    }

    @GetMapping("/csrf")
    public ResponseEntity<?> csrf(CsrfToken token) {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "token", token != null ? token.getToken() : "",
            "headerName", token != null ? token.getHeaderName() : "X-XSRF-TOKEN",
            "parameterName", token != null ? token.getParameterName() : "_csrf"
        ));
    }

    private UserView view(AppUser u) {
        return new UserView(
            u.getId(),
            u.getFirstName(),
            u.getLastName(),
            u.getEmail(),
            u.getMobile(),
            u.getRole().name(),
            u.getFarmName(),
            u.getAddress(),
            u.getCity(),
            u.getPinCode(),
            u.getState()
        );
    }

    private String blankDefault(String v, String d) {
        return v == null || v.isBlank() ? d : v.trim();
    }
}
