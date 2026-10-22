package in.kisankhata.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;

import java.util.Collections;
import java.util.Iterator;

@Configuration
public class OAuth2Config {

    private static final Logger log = LoggerFactory.getLogger(OAuth2Config.class);

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository(Environment env) {
        String clientId = resolveProperty(env,
            "spring.security.oauth2.client.registration.google.client-id",
            "SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID",
            "GOOGLE_CLIENT_ID",
            "app.oauth2.google.client-id"
        );

        String clientSecret = resolveProperty(env,
            "spring.security.oauth2.client.registration.google.client-secret",
            "SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET",
            "GOOGLE_CLIENT_SECRET",
            "app.oauth2.google.client-secret"
        );

        boolean hasClientId = clientId != null && !clientId.isBlank();
        boolean hasClientSecret = clientSecret != null && !clientSecret.isBlank();

        if (hasClientId && hasClientSecret) {
            ClientRegistration googleRegistration = CommonOAuth2Provider.GOOGLE.getBuilder("google")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .scope("openid", "profile", "email")
                .build();

            log.info("Google OAuth2 client registration initialized successfully.");
            return new InMemoryClientRegistrationRepository(googleRegistration);
        }

        if (hasClientId && !hasClientSecret) {
            log.warn("Google OAuth2 Client ID is configured, but Client Secret is missing. Google OAuth sign-in is disabled.");
        } else if (!hasClientId && hasClientSecret) {
            log.warn("Google OAuth2 Client Secret is configured, but Client ID is missing. Google OAuth sign-in is disabled.");
        } else {
            log.info("Google OAuth2 credentials not configured. Google OAuth sign-in is disabled.");
        }

        return new UnconfiguredClientRegistrationRepository();
    }

    private String resolveProperty(Environment env, String... keys) {
        for (String key : keys) {
            String val = env.getProperty(key);
            if (val != null && !val.trim().isBlank()) {
                return val.trim();
            }
        }
        return null;
    }

    private static class UnconfiguredClientRegistrationRepository
        implements ClientRegistrationRepository, Iterable<ClientRegistration> {

        @Override
        public ClientRegistration findByRegistrationId(String registrationId) {
            return null;
        }

        @Override
        public Iterator<ClientRegistration> iterator() {
            return Collections.emptyIterator();
        }
    }
}
