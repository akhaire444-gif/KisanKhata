package in.kisankhata.config;

import in.kisankhata.user.AppUser;
import in.kisankhata.user.Role;
import in.kisankhata.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final String frontendOrigin;

    public OAuth2SuccessHandler(
        UserRepository userRepo,
        PasswordEncoder encoder,
        @Value("${app.cors.allowed-origin:http://localhost:3000}") String frontendOrigin
    ) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.frontendOrigin = frontendOrigin != null && frontendOrigin.endsWith("/")
            ? frontendOrigin.substring(0, frontendOrigin.length() - 1)
            : (frontendOrigin != null && !frontendOrigin.isBlank() ? frontendOrigin : "http://localhost:3000");
    }

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException {
        if (authentication.getPrincipal() instanceof OAuth2User oauthUser) {
            String email = oauthUser.getAttribute("email");
            if (email == null || email.isBlank()) {
                response.sendRedirect(frontendOrigin + "/?auth=error&message=email_missing");
                return;
            }

            email = email.toLowerCase().trim();
            String name = oauthUser.getAttribute("name");
            String firstName = oauthUser.getAttribute("given_name");
            String lastName = oauthUser.getAttribute("family_name");

            if (firstName == null || firstName.isBlank()) {
                if (name != null && !name.isBlank()) {
                    String[] parts = name.trim().split("\\s+", 2);
                    firstName = parts[0];
                    lastName = parts.length > 1 ? parts[1] : "Farmer";
                } else {
                    firstName = "Kisan";
                    lastName = "Farmer";
                }
            }
            if (lastName == null || lastName.isBlank()) {
                lastName = "Farmer";
            }

            final String finalFirstName = firstName;
            final String finalLastName = lastName;
            final String finalEmail = email;

            AppUser appUser = userRepo.findByEmailIgnoreCase(email).orElseGet(() -> {
                String randomPass = UUID.randomUUID().toString();
                return userRepo.save(new AppUser(
                    finalFirstName,
                    finalLastName,
                    finalEmail,
                    "0000000000",
                    encoder.encode(randomPass),
                    Role.FARMER,
                    finalFirstName + " Krishi Farm",
                    "Rural Farm",
                    "Maharashtra"
                ));
            });

            if (!appUser.isActive()) {
                response.sendRedirect(frontendOrigin + "/?auth=error&message=account_disabled");
                return;
            }

            // Establish secure Spring Security context in HTTP session
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            request.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

            response.sendRedirect(frontendOrigin + "/?auth=success");
            return;
        }

        response.sendRedirect(frontendOrigin + "/?auth=success");
    }
}
