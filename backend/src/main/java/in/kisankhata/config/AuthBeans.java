package in.kisankhata.config;
import in.kisankhata.user.*;
import org.springframework.context.annotation.*;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.password.PasswordEncoder;
@Configuration
public class AuthBeans {
 @Bean UserDetailsService userDetailsService(UserRepository users) {
  return email -> { AppUser u=users.findByEmailIgnoreCase(email).orElseThrow(()->new UsernameNotFoundException("Invalid credentials"));
   if(!u.isActive()) throw new UsernameNotFoundException("Invalid credentials");
   return User.withUsername(u.getEmail()).password(u.getPasswordHash()).roles(u.getRole().name()).build(); };
 }
 @Bean DaoAuthenticationProvider authenticationProvider(UserDetailsService uds,PasswordEncoder encoder) {
  DaoAuthenticationProvider p=new DaoAuthenticationProvider();p.setUserDetailsService(uds);p.setPasswordEncoder(encoder);return p;
 }
 @Bean AuthenticationManager authenticationManager(AuthenticationConfiguration c) throws Exception{return c.getAuthenticationManager();}
}
