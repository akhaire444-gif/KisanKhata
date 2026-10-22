# KisanKhata Deployment & Operational Runbook

## 1. System Requirements
- **Host OS:** Linux (Ubuntu 22.04 LTS recommended), macOS, or Windows Server.
- **Java Runtime:** Eclipse Temurin OpenJDK 17 LTS or later (`java -version`).
- **Memory:** Minimum 512 MB RAM (1 GB recommended).
- **Disk:** Minimum 5 GB persistent disk space for `./data` (database and uploads).

## 2. Configuration & Environment Variables

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `8080` | HTTP listening port (automatically set by Render) |
| `DATABASE_URL` | `jdbc:h2:file:./data/kisankhata;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE` | Database connection string |
| `DATABASE_USERNAME`| `sa` | Database username |
| `DATABASE_PASSWORD`| *(empty)* | Database password |
| `FRONTEND_ORIGIN` | `https://kisan-khata-x1dp.vercel.app` (or `http://localhost:5173`) | Allowed CORS and OAuth post-login redirect origin |
| `BOOTSTRAP_ADMIN_EMAIL` | *(empty)* | Initial admin email address (required for first start) |
| `BOOTSTRAP_ADMIN_PASSWORD` | *(empty)* | Initial admin password (min 12 characters, required for first start) |
| `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_ID` | *(empty)* | Google OAuth 2.0 Web Client ID (from Google Cloud Console) |
| `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET` or `GOOGLE_CLIENT_SECRET` | *(empty)* | Google OAuth 2.0 Client Secret (from Google Cloud Console) |
| `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_REDIRECT_URI` or `GOOGLE_REDIRECT_URI` | `{baseUrl}/login/oauth2/code/{registrationId}` | Redirect URI template sent to Google (defaults to `{baseUrl}/login/oauth2/code/{registrationId}`) |
| `SESSION_COOKIE_SAMESITE` | `lax` (set to `none` on Render) | SameSite attribute for session cookie (`none` required for cross-domain Vercel frontend) |
| `SESSION_COOKIE_SECURE` | `false` (set to `true` on Render) | Secure attribute for session cookie (`true` required when SameSite is None) |

> **Google Cloud Console OAuth 2.0 Client Setup:**
> 1. Open [Google Cloud Console](https://console.cloud.google.com/) > **APIs & Services** > **Credentials**.
> 2. Open your Web application OAuth 2.0 Client ID (e.g. `1070379141067-8hk7gicbpd85165oqricvld4idn9d1j9...`).
> 3. Under **Authorized JavaScript origins**, add:
>    - `https://kisan-khata-x1dp.vercel.app`
>    - `https://kisankhata-1.onrender.com`
>    - `http://localhost:5173`
>    - `http://localhost:3000`
> 4. Under **Authorized redirect URIs**, add the exact backend OAuth2 code callback URI:
>    - `https://kisankhata-1.onrender.com/login/oauth2/code/google`
>    - `http://localhost:8080/login/oauth2/code/google` (for local development)
> 5. Click **Save**. Note: Google Cloud Console changes may take 2-5 minutes to propagate across Google's auth servers.

## 3. Build & Packaging Instructions

```bash
# Navigate to backend directory
cd backend

# Build runnable JAR package (skipping tests if offline)
mvn clean package -DskipTests

# Output executable JAR:
# target/kisankhata-backend-0.1.0.jar
```

## 4. Running the Single-JAR Application

```bash
# Run locally with embedded database and automatic bootstrap admin
export PORT=8080
export FRONTEND_ORIGIN="http://localhost:3000"
export BOOTSTRAP_ADMIN_EMAIL="admin@kisankhata.in"
export BOOTSTRAP_ADMIN_PASSWORD="SecureAdminPassword2026!"

java -jar target/kisankhata-backend-0.1.0.jar
```

## 5. Production Reverse Proxy Configuration (Nginx)

```nginx
server {
    listen 80;
    server_name app.kisankhata.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.kisankhata.in;

    ssl_certificate /etc/letsencrypt/live/app.kisankhata.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.kisankhata.in/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Static uploads caching & serving
    location /api/v1/files/ {
        proxy_pass http://127.0.0.1:8080;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # API Proxy
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cookie_path / "/; Secure; HttpOnly; SameSite=Lax";
    }
}
```

## 6. Backup & Recovery Procedure

### Automated Backup Script (`backup.sh`)
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/kisankhata"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

# Hot copy H2 database file and uploaded images
tar -czf "$BACKUP_DIR/kisankhata_backup_$TIMESTAMP.tar.gz" -C /opt/kisankhata data

# Retain 30 days of backups
find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +30 -delete
```

### Recovery Steps
1. Stop the application service: `systemctl stop kisankhata`.
2. Extract the archive into the application root: `tar -xzf backup.tar.gz -C /opt/kisankhata`.
3. Verify file permissions: `chown -R kisankhata:kisankhata /opt/kisankhata/data`.
4. Restart service: `systemctl start kisankhata`.
5. Check health: `curl -f http://localhost:8080/actuator/health`.
