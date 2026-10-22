package in.kisankhata.auth;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID=real-render-client-id-999.apps.googleusercontent.com",
    "SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET=real-render-client-secret-999"
})
public class OAuth2AuthorizationIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Test
    @DisplayName("/oauth2/authorization/google redirects to Google with the configured Client ID and NOT unconfigured")
    void testOAuthAuthorizationRedirectContainsConfiguredClientId() throws Exception {
        var result = mvc.perform(get("/oauth2/authorization/google"))
            .andExpect(status().is3xxRedirection())
            .andReturn();

        String redirectedUrl = result.getResponse().getRedirectedUrl();
        assertThat(redirectedUrl).isNotNull();
        assertThat(redirectedUrl).contains("https://accounts.google.com/o/oauth2/v2/auth");
        assertThat(redirectedUrl).contains("client_id=real-render-client-id-999.apps.googleusercontent.com");
        assertThat(redirectedUrl).doesNotContain("unconfigured");
    }

    @Test
    @DisplayName("/oauth2/authorization/google with Render forwarded headers generates exact HTTPS Render redirect URI")
    void testOAuthAuthorizationRedirectWithRenderForwardedHeaders() throws Exception {
        var result = mvc.perform(get("/oauth2/authorization/google")
                .header("X-Forwarded-Proto", "https")
                .header("X-Forwarded-Host", "kisankhata-1.onrender.com")
                .header("X-Forwarded-Port", "443"))
            .andExpect(status().is3xxRedirection())
            .andReturn();

        String redirectedUrl = result.getResponse().getRedirectedUrl();
        assertThat(redirectedUrl).isNotNull();
        assertThat(redirectedUrl).contains("redirect_uri=https://kisankhata-1.onrender.com/login/oauth2/code/google");
        assertThat(redirectedUrl).doesNotContain("http://kisankhata-1.onrender.com");
    }
}
