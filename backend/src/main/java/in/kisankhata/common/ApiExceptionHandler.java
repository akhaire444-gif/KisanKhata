package in.kisankhata.common;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.AccessDeniedException;
import java.time.Instant;
import java.util.*;
@RestControllerAdvice
public class ApiExceptionHandler {
 @ExceptionHandler(IllegalArgumentException.class)
 ResponseEntity<?> badRequest(IllegalArgumentException e) { return response(HttpStatus.BAD_REQUEST,"BAD_REQUEST",e.getMessage()); }
 @ExceptionHandler(NoSuchElementException.class)
 ResponseEntity<?> notFound(NoSuchElementException e) { return response(HttpStatus.NOT_FOUND,"NOT_FOUND","Resource not found"); }
 @ExceptionHandler(MethodArgumentNotValidException.class)
 ResponseEntity<?> validation(MethodArgumentNotValidException e) {
   var errors=e.getBindingResult().getFieldErrors().stream().map(x -> Map.of("field",x.getField(),"message",Objects.toString(x.getDefaultMessage(),"Invalid value"))).toList();
   return ResponseEntity.badRequest().body(Map.of("success",false,"code","VALIDATION_ERROR","message","Validation failed","errors",errors,"timestamp",Instant.now().toString()));
 }
 @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
 ResponseEntity<?> badCredentials(org.springframework.security.authentication.BadCredentialsException e) { return response(HttpStatus.UNAUTHORIZED,"BAD_CREDENTIALS","Invalid email or password"); }
 @ExceptionHandler(AccessDeniedException.class)
 ResponseEntity<?> forbidden() { return response(HttpStatus.FORBIDDEN,"FORBIDDEN","You do not have permission to perform this action"); }
 @ExceptionHandler(Exception.class)
 ResponseEntity<?> unexpected(Exception e) { return response(HttpStatus.INTERNAL_SERVER_ERROR,"INTERNAL_ERROR","An unexpected error occurred"); }
 private ResponseEntity<?> response(HttpStatus s,String code,String message) { return ResponseEntity.status(s).body(Map.of("success",false,"code",code,"message",message,"timestamp",Instant.now().toString())); }
}
