package in.kisankhata.auth;

import in.kisankhata.config.OAuth2Config;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;

import static org.assertj.core.api.Assertions.assertThat;

public class OAuth2ConfigTest {

    private final OAuth2Config config = new OAuth2Config();

    @Test
    @DisplayName("Loads Google Client ID and Secret from Render standard Spring Security env vars")
    void testLoadsFromSpringSecurityEnvVars() {
        MockEnvironment env = new MockEnvironment();
        env.setProperty("SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID", "render-test-client-id-123.apps.googleusercontent.com");
        env.setProperty("SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET", "render-test-secret-456");

        ClientRegistrationRepository repo = config.clientRegistrationRepository(env);
        ClientRegistration reg = repo.findByRegistrationId("google");

        assertThat(reg).isNotNull();
        assertThat(reg.getClientId()).isEqualTo("render-test-client-id-123.apps.googleusercontent.com");
        assertThat(reg.getClientSecret()).isEqualTo("render-test-secret-456");
        assertThat(reg.getClientId()).doesNotContain("unconfigured");
    }

    @Test
    @DisplayName("Loads Google Client ID and Secret from GOOGLE_CLIENT_ID env var")
    void testLoadsFromGoogleClientIdEnvVar() {
        MockEnvironment env = new MockEnvironment();
        env.setProperty("GOOGLE_CLIENT_ID", "google-env-client-id-789.apps.googleusercontent.com");
        env.setProperty("GOOGLE_CLIENT_SECRET", "google-env-secret-789");

        ClientRegistrationRepository repo = config.clientRegistrationRepository(env);
        ClientRegistration reg = repo.findByRegistrationId("google");

        assertThat(reg).isNotNull();
        assertThat(reg.getClientId()).isEqualTo("google-env-client-id-789.apps.googleusercontent.com");
        assertThat(reg.getClientSecret()).isEqualTo("google-env-secret-789");
    }

    @Test
    @DisplayName("When OAuth credentials are missing, returns null registration and NO placeholder defaults")
    void testMissingCredentialsReturnsNullWithoutPlaceholders() {
        MockEnvironment env = new MockEnvironment();

        ClientRegistrationRepository repo = config.clientRegistrationRepository(env);
        ClientRegistration reg = repo.findByRegistrationId("google");

        assertThat(reg).isNull();
    }

    @Test
    @DisplayName("When only client-id is provided without secret, OAuth is safely disabled")
    void testMissingSecretSafelyDisablesOAuth() {
        MockEnvironment env = new MockEnvironment();
        env.setProperty("SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID", "client-id-only");

        ClientRegistrationRepository repo = config.clientRegistrationRepository(env);
        ClientRegistration reg = repo.findByRegistrationId("google");

        assertThat(reg).isNull();
    }

    @Test
    @DisplayName("Default redirect URI template is {baseUrl}/login/oauth2/code/{registrationId}")
    void testDefaultRedirectUriTemplate() {
        MockEnvironment env = new MockEnvironment();
        env.setProperty("GOOGLE_CLIENT_ID", "mock-client-id");
        env.setProperty("GOOGLE_CLIENT_SECRET", "mock-client-secret");

        ClientRegistrationRepository repo = config.clientRegistrationRepository(env);
        ClientRegistration reg = repo.findByRegistrationId("google");

        assertThat(reg).isNotNull();
        assertThat(reg.getRedirectUri()).isEqualTo("{baseUrl}/login/oauth2/code/{registrationId}");
    }

    @Test
    @DisplayName("Custom redirect URI template from env var is honored")
    void testCustomRedirectUriTemplate() {
        MockEnvironment env = new MockEnvironment();
        env.setProperty("GOOGLE_CLIENT_ID", "mock-client-id");
        env.setProperty("GOOGLE_CLIENT_SECRET", "mock-client-secret");
        env.setProperty("SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_REDIRECT_URI", "https://kisankhata-1.onrender.com/login/oauth2/code/google");

        ClientRegistrationRepository repo = config.clientRegistrationRepository(env);
        ClientRegistration reg = repo.findByRegistrationId("google");

        assertThat(reg).isNotNull();
        assertThat(reg.getRedirectUri()).isEqualTo("https://kisankhata-1.onrender.com/login/oauth2/code/google");
    }
}
