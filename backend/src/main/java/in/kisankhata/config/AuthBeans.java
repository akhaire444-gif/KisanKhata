package in.kisankhata.config;

import in.kisankhata.user.AppUser;
import in.kisankhata.user.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Configuration
public class AuthBeans {

    @Bean
    public UserDetailsService userDetailsService(UserRepository users) {
        return email -> {
            AppUser u = users.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
            if (!u.isActive()) {
                throw new UsernameNotFoundException("Invalid credentials");
            }
            String passHash = u.getPasswordHash();
            if (passHash == null || passHash.isBlank()) {
                // Unusable dummy hash for Google-only users so email+password login fails cleanly with BadCredentialsException (never 500)
                passHash = "$2a$12$e80yq9O8jU8tN7RjY4xQOOBs71b9H0f6s5iNqP1x3f7lW6v9z0.12";
            }
            return User.withUsername(u.getEmail())
                    .password(passHash)
                    .roles(u.getRole().name())
                    .build();
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration c) throws Exception {
        return c.getAuthenticationManager();
    }
}

