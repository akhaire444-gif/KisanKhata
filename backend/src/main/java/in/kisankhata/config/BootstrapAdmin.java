package in.kisankhata.config;
import in.kisankhata.user.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
@Configuration
public class BootstrapAdmin {
 @Bean CommandLineRunner bootstrapAdminRunner(UserRepository users,PasswordEncoder encoder,
   @Value("${app.bootstrap-admin.email:}") String email,@Value("${app.bootstrap-admin.password:}") String password) {
  return args -> {
   if(email==null||email.isBlank()||password==null||password.isBlank()) return;
   if(password.length()<12) throw new IllegalStateException("BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters");
   if(!users.existsByEmailIgnoreCase(email)) users.save(new AppUser("Platform","Admin",email,"0000000000",encoder.encode(password),Role.ADMIN,"KisanKhata Admin","", "India"));
  };
 }
}
