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
    public SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        OAuth2SuccessHandler oauth2SuccessHandler,
        Environment env
    ) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers(
                    "/api/v1/auth/register",
                    "/api/v1/auth/register-buyer",
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
                    "/api/v1/auth/register-buyer",
                    "/api/v1/auth/login",
                    "/api/v1/auth/csrf",
                    "/actuator/health",
                    "/actuator/health/**",
                    "/api/v1/files/**",
                    "/oauth2/**",
                    "/login/oauth2/**"
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
            .oauth2Login(oauth -> oauth
                .successHandler(oauth2SuccessHandler)
                .failureHandler((req, res, ex) -> {
                    String redirect = env.getProperty("app.cors.allowed-origin");
                    String serverName = req.getServerName();
                    if (serverName != null && !serverName.equalsIgnoreCase("localhost") && !serverName.equals("127.0.0.1")) {
                        if (redirect == null || redirect.contains("localhost") || redirect.contains("127.0.0.1")) {
                            redirect = "https://kisan-khata-x1dp.vercel.app";
                        }
                    }
                    if (redirect == null || redirect.isBlank()) {
                        redirect = "http://localhost:3000";
                    }
                    if (redirect.endsWith("/")) {
                        redirect = redirect.substring(0, redirect.length() - 1);
                    }
                    res.sendRedirect(redirect + "/?auth=error&message=oauth_failed");
                })
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

        String allowedOrigin = env.getProperty("app.cors.allowed-origin");
        if (allowedOrigin != null && !allowedOrigin.isBlank()) {
            String trimmed = allowedOrigin.trim();
            if (trimmed.endsWith("/")) {
                trimmed = trimmed.substring(0, trimmed.length() - 1);
            }
            if (!origins.contains(trimmed)) {
                origins.add(trimmed);
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
