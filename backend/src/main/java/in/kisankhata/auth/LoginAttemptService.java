package in.kisankhata.auth;

import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_SECONDS = 600; // 10 minutes

    private static class Attempt {
        int count;
        Instant firstFailedAt;
        Instant lockedUntil;

        Attempt(Instant now) {
            this.count = 1;
            this.firstFailedAt = now;
        }
    }

    private final ConcurrentHashMap<String, Attempt> attemptsCache = new ConcurrentHashMap<>();

    public boolean isBlocked(String email) {
        if (email == null) return false;
        String key = email.toLowerCase().trim();
        Attempt attempt = attemptsCache.get(key);
        if (attempt == null) return false;

        Instant now = Instant.now();
        if (attempt.lockedUntil != null) {
            if (now.isBefore(attempt.lockedUntil)) {
                return true;
            } else {
                // Lock expired
                attemptsCache.remove(key);
                return false;
            }
        }
        return false;
    }

    public void loginFailed(String email) {
        if (email == null) return;
        String key = email.toLowerCase().trim();
        Instant now = Instant.now();

        attemptsCache.compute(key, (k, attempt) -> {
            if (attempt == null) {
                return new Attempt(now);
            }
            // If more than 10 minutes passed since first failure, reset
            if (now.isAfter(attempt.firstFailedAt.plusSeconds(LOCKOUT_DURATION_SECONDS))) {
                return new Attempt(now);
            }
            attempt.count++;
            if (attempt.count >= MAX_ATTEMPTS) {
                attempt.lockedUntil = now.plusSeconds(LOCKOUT_DURATION_SECONDS);
            }
            return attempt;
        });
    }

    public void loginSucceeded(String email) {
        if (email == null) return;
        attemptsCache.remove(email.toLowerCase().trim());
    }
}
