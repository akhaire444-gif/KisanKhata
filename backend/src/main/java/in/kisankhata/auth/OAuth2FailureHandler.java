package in.kisankhata.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2FailureHandler implements AuthenticationFailureHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2FailureHandler.class);

    private final String frontendUrl;

    public OAuth2FailureHandler(
        @Value("${app.frontend-url:${FRONTEND_ORIGIN:http://localhost:3000}}") String frontendUrl
    ) {
        this.frontendUrl = normalizeFrontendUrl(frontendUrl);
    }

    private static String normalizeFrontendUrl(String url) {
        if (url == null || url.isBlank()) return "http://localhost:3000";
        String trimmed = url.trim();
        return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException {
        log.warn("OAuth2 authentication failed: {}", exception.getMessage());
        response.sendRedirect(frontendUrl + "/?auth=error&code=GOOGLE_LOGIN_FAILED");
    }
}

