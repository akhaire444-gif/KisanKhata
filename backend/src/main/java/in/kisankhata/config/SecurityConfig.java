package in.kisankhata.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers(
                    "/api/v1/auth/register",
                    "/api/v1/auth/register-buyer",
                    "/api/v1/auth/login",
                    "/actuator/health",
                    "/actuator/health/**"
                )
            )
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                // Public authentication & health endpoints
                .requestMatchers(
                    "/api/v1/auth/register",
                    "/api/v1/auth/register-buyer",
                    "/api/v1/auth/login",
                    "/api/v1/auth/csrf",
                    "/actuator/health",
                    "/actuator/health/**",
                    "/api/v1/files/**"
                ).permitAll()

                // Public marketplace browsing
                .requestMatchers(HttpMethod.GET, "/api/v1/mart/products", "/api/v1/mart/products/**", "/api/v1/mart/payment-settings").permitAll()

                // Role-restricted domains
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/farmer/**").hasRole("FARMER")
                .requestMatchers("/api/v1/mart/cart/**", "/api/v1/mart/checkout", "/api/v1/mart/orders/**").hasAnyRole("BUYER", "ADMIN")

                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .formLogin(f -> f.disable())
            .httpBasic(b -> b.disable())
            .logout(logout -> logout
                .logoutUrl("/api/v1/auth/logout")
                .deleteCookies("JSESSIONID")
                .invalidateHttpSession(true)
                .logoutSuccessHandler((req, res, auth) -> res.setStatus(204))
            )
            .sessionManagement(s -> s
                .maximumSessions(3)
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(Environment env) {
        CorsConfiguration config = new CorsConfiguration();
        String allowedOrigin = env.getProperty("app.cors.allowed-origin", "http://localhost:5173");
        config.setAllowedOrigins(List.of(allowedOrigin, "http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Content-Type", "X-XSRF-TOKEN", "X-Requested-With", "Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
