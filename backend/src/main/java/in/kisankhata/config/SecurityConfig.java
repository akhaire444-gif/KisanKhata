package in.kisankhata.config;

import in.kisankhata.auth.OAuth2FailureHandler;
import in.kisankhata.auth.OAuth2SuccessHandler;
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

    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final OAuth2FailureHandler oAuth2FailureHandler;

    @org.springframework.beans.factory.annotation.Value("${SESSION_COOKIE_SAMESITE:${server.servlet.session.cookie.same-site:lax}}")
    private String sameSiteProp;

    @org.springframework.beans.factory.annotation.Value("${SESSION_COOKIE_SECURE:${server.servlet.session.cookie.secure:false}}")
    private boolean secureProp;

    public SecurityConfig(OAuth2SuccessHandler oAuth2SuccessHandler, OAuth2FailureHandler oAuth2FailureHandler) {
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.oAuth2FailureHandler = oAuth2FailureHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        CookieCsrfTokenRepository repo = CookieCsrfTokenRepository.withHttpOnlyFalse();
        String sameSite = "none".equalsIgnoreCase(sameSiteProp) ? "None" : ("lax".equalsIgnoreCase(sameSiteProp) ? "Lax" : sameSiteProp);
        boolean secure = secureProp || "None".equalsIgnoreCase(sameSite);
        repo.setCookieCustomizer(c -> c.sameSite(sameSite).secure(secure).path("/"));

        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(repo)
                .ignoringRequestMatchers(
                    "/api/v1/auth/register",
                    "/api/v1/auth/login",
                    "/api/v1/auth/logout",
                    "/actuator/health",
                    "/actuator/health/**"
                )
            )
            .cors(Customizer.withDefaults())
            .exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) -> {
                    res.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                    res.setContentType("application/json");
                    res.getWriter().write("{\"success\":false,\"code\":\"UNAUTHORIZED\",\"message\":\"Authentication required\"}");
                })
                .accessDeniedHandler((req, res, ex) -> {
                    res.setStatus(jakarta.servlet.http.HttpServletResponse.SC_FORBIDDEN);
                    res.setContentType("application/json");
                    res.getWriter().write("{\"success\":false,\"code\":\"FORBIDDEN\",\"message\":\"Access denied\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Public authentication & health endpoints
                .requestMatchers(
                    "/api/v1/auth/register",
                    "/api/v1/auth/login",
                    "/api/v1/auth/google/start",
                    "/oauth2/**",
                    "/login/oauth2/**",
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
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
                .failureHandler(oAuth2FailureHandler)
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
        java.util.List<String> origins = new java.util.ArrayList<>();
        origins.add("http://localhost:5173");
        origins.add("http://localhost:3000");
        origins.add("https://kisan-khata-x1dp.vercel.app");

        String[] envKeys = {"app.cors.allowed-origin", "app.frontend-url", "FRONTEND_ORIGIN"};
        for (String key : envKeys) {
            String origin = env.getProperty(key);
            if (origin != null && !origin.isBlank()) {
                String trimmed = origin.trim();
                if (trimmed.endsWith("/")) {
                    trimmed = trimmed.substring(0, trimmed.length() - 1);
                }
                if (!origins.contains(trimmed)) {
                    origins.add(trimmed);
                }
            }
        }

        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Content-Type", "X-XSRF-TOKEN", "X-Requested-With", "Authorization", "Accept", "Origin"));
        config.setExposedHeaders(List.of("Set-Cookie", "X-XSRF-TOKEN"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
