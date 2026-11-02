package in.kisankhata.auth;

import in.kisankhata.user.AppUser;
import in.kisankhata.user.AuthProvider;
import in.kisankhata.user.Role;
import in.kisankhata.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2SuccessHandler.class);

    private final UserRepository users;
    private final String frontendUrl;

    public OAuth2SuccessHandler(
        UserRepository users,
        @Value("${app.frontend-url:${FRONTEND_ORIGIN:http://localhost:3000}}") String frontendUrl
    ) {
        this.users = users;
        this.frontendUrl = normalizeFrontendUrl(frontendUrl);
    }

    private static String normalizeFrontendUrl(String url) {
        if (url == null || url.isBlank()) return "http://localhost:3000";
        String trimmed = url.trim();
        return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        if (!(authentication.getPrincipal() instanceof OAuth2User oAuth2User)) {
            log.error("Principal is not an OAuth2User: {}", authentication.getPrincipal());
            response.sendRedirect(frontendUrl + "/?auth=error&code=GOOGLE_LOGIN_FAILED");
            return;
        }

        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        if (email == null || email.isBlank()) {
            log.warn("OAuth2 login rejected: missing email in attributes");
            response.sendRedirect(frontendUrl + "/?auth=error&code=EMAIL_NOT_VERIFIED");
            return;
        }
        email = email.toLowerCase().trim();

        Object ev = attributes.get("email_verified");
        boolean emailVerified = Boolean.TRUE.equals(ev) || "true".equalsIgnoreCase(String.valueOf(ev));
        if (!emailVerified) {
            log.warn("OAuth2 login rejected for unverified email: {}", email);
            response.sendRedirect(frontendUrl + "/?auth=error&code=EMAIL_NOT_VERIFIED");
            return;
        }

        String sub = (String) attributes.get("sub");
        String givenName = (String) attributes.get("given_name");
        String familyName = (String) attributes.get("family_name");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        Optional<AppUser> existing = users.findByEmailIgnoreCase(email);
        AppUser user;

        if (existing.isPresent()) {
            user = existing.get();
            if (!user.isActive()) {
                log.warn("OAuth2 login rejected: account is disabled for {}", email);
                response.sendRedirect(frontendUrl + "/?auth=error&code=ACCOUNT_DISABLED");
                return;
            }

            // Link Google account details without modifying existing role
            if (sub != null && !sub.isBlank()) {
                user.setGoogleSub(sub);
            }
            if (picture != null && !picture.isBlank() && (user.getPictureUrl() == null || user.getPictureUrl().isBlank())) {
                user.setPictureUrl(picture);
            }
            user = users.save(user);
            log.info("Linked Google authentication for existing user: {} with role: {}", email, user.getRole());
        } else {
            // New user registration
            HttpSession session = request.getSession(false);
            String requestedRole = session != null ? (String) session.getAttribute("oauth2_auth_role") : null;
            Role assignedRole = "BUYER".equalsIgnoreCase(requestedRole) ? Role.BUYER : Role.FARMER;

            String firstName = (givenName != null && !givenName.isBlank()) ? givenName.trim() : null;
            String lastName = (familyName != null && !familyName.isBlank()) ? familyName.trim() : null;

            if (firstName == null) {
                if (name != null && !name.isBlank()) {
                    String[] parts = name.trim().split("\\s+", 2);
                    firstName = parts[0];
                    if (parts.length > 1 && lastName == null) {
                        lastName = parts[1];
                    }
                } else {
                    int atIndex = email.indexOf('@');
                    firstName = atIndex > 0 ? email.substring(0, atIndex) : email;
                }
            }

            if (lastName == null || lastName.isBlank()) {
                lastName = "-";
            }

            AppUser newUser = new AppUser();
            newUser.setFirstName(firstName);
            newUser.setLastName(lastName);
            newUser.setEmail(email);
            newUser.setRole(assignedRole);
            newUser.setAuthProvider(AuthProvider.GOOGLE);
            newUser.setGoogleSub(sub);
            newUser.setPictureUrl(picture);
            newUser.setPasswordHash(null);
            newUser.setMobile(""); // Needs profile completion
            newUser.setActive(true);

            if (assignedRole == Role.FARMER) {
                newUser.setFarmName(firstName + " Krishi Farm");
                newUser.setAddress("Nashik Rural");
                newUser.setState("Maharashtra");
            } else {
                newUser.setAddress("");
                newUser.setCity("");
                newUser.setPinCode("");
                newUser.setState("Maharashtra");
            }

            user = users.save(newUser);
            log.info("Created new user via Google OAuth2: {} with role: {}", email, assignedRole);
        }

        // Replace OAuth2 token with standard UsernamePasswordAuthenticationToken for app consistency
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        UsernamePasswordAuthenticationToken standardAuth = new UsernamePasswordAuthenticationToken(
            user.getEmail(),
            null,
            authorities
        );

        // Session fixation protection
        request.changeSessionId();

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(standardAuth);
        SecurityContextHolder.setContext(context);
        request.getSession().setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        // Redirect to frontend
        String redirectTarget = frontendUrl + "/?auth=success";
        if (!user.isProfileComplete()) {
            redirectTarget += "&profile=incomplete";
        }
        response.sendRedirect(redirectTarget);
    }
}

