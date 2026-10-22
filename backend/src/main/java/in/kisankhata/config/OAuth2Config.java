package in.kisankhata.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;

@Configuration
public class OAuth2Config {

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository(
        @Value("${app.oauth2.google.client-id:}") String clientId,
        @Value("${app.oauth2.google.client-secret:}") String clientSecret
    ) {
        String effectiveClientId = (clientId != null && !clientId.isBlank())
            ? clientId.trim()
            : "unconfigured-google-client-id";

        String effectiveClientSecret = (clientSecret != null && !clientSecret.isBlank())
            ? clientSecret.trim()
            : "unconfigured-google-client-secret";

        ClientRegistration googleRegistration = CommonOAuth2Provider.GOOGLE.getBuilder("google")
            .clientId(effectiveClientId)
            .clientSecret(effectiveClientSecret)
            .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
            .scope("openid", "profile", "email")
            .build();

        return new InMemoryClientRegistrationRepository(googleRegistration);
    }
}
