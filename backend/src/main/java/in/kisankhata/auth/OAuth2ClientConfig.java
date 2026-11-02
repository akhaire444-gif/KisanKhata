package in.kisankhata.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;

@Configuration
public class OAuth2ClientConfig {

    private static final Logger log = LoggerFactory.getLogger(OAuth2ClientConfig.class);

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String googleClientSecret;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri:{baseUrl}/login/oauth2/code/google}")
    private String googleRedirectUri;

    public boolean isGoogleConfigured() {
        return googleClientId != null && !googleClientId.trim().isBlank()
            && googleClientSecret != null && !googleClientSecret.trim().isBlank();
    }

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        String redirectUri = (googleRedirectUri != null && !googleRedirectUri.trim().isBlank())
            ? googleRedirectUri.trim()
            : "{baseUrl}/login/oauth2/code/google";

        if (isGoogleConfigured()) {
            log.info("Google OAuth2 client configured with Client ID: {}... and redirect URI: {}",
                googleClientId.substring(0, Math.min(12, googleClientId.length())),
                redirectUri);
            ClientRegistration googleRegistration = CommonOAuth2Provider.GOOGLE.getBuilder("google")
                .clientId(googleClientId.trim())
                .clientSecret(googleClientSecret.trim())
                .scope("openid", "profile", "email")
                .redirectUri(redirectUri)
                .build();
            return new InMemoryClientRegistrationRepository(googleRegistration);
        }

        log.warn("Google OAuth2 is NOT configured. Client ID or Client Secret missing. Registering placeholder registration to allow startup.");
        ClientRegistration placeholderRegistration = ClientRegistration.withRegistrationId("google")
            .clientId("placeholder-google-client-id")
            .clientSecret("placeholder-google-client-secret")
            .clientName("Google")
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri(redirectUri)
            .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
            .tokenUri("https://oauth2.googleapis.com/token")
            .userInfoUri("https://openidconnect.googleapis.com/v1/userinfo")
            .userNameAttributeName(IdTokenClaimNames.SUB)
            .jwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
            .build();
        return new InMemoryClientRegistrationRepository(placeholderRegistration);
    }
}

