package in.kisankhata.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class LoginAttemptServiceTest {

    private LoginAttemptService service;

    @BeforeEach
    void setUp() {
        service = new LoginAttemptService();
    }

    @Test
    void testNotBlockedInitially() {
        assertFalse(service.isBlocked("farmer@example.com"));
    }

    @Test
    void testBlockedAfterFiveFailedAttempts() {
        String email = "farmer@example.com";
        for (int i = 0; i < 4; i++) {
            service.loginFailed(email);
            assertFalse(service.isBlocked(email), "Should not be blocked before 5 attempts");
        }

        // 5th failed attempt triggers lockout
        service.loginFailed(email);
        assertTrue(service.isBlocked(email), "Should be blocked after 5 failed attempts");
    }

    @Test
    void testResetOnSuccessfulLogin() {
        String email = "farmer2@example.com";
        service.loginFailed(email);
        service.loginFailed(email);
        service.loginFailed(email);

        service.loginSucceeded(email);
        assertFalse(service.isBlocked(email));

        // 2 more fails should not block (count reset)
        service.loginFailed(email);
        service.loginFailed(email);
        assertFalse(service.isBlocked(email));
    }
}
