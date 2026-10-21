package in.kisankhata.farm;

import in.kisankhata.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/farmer/workers")
public class WorkerController {

    private final WorkerRepository repo;
    private final UserRepository users;

    public WorkerController(WorkerRepository repo, UserRepository users) {
        this.repo = repo;
        this.users = users;
    }

    public record Request(
        @NotBlank @Size(max = 120) String name,
        @Min(0) @Max(3660) int daysWorked,
        @NotNull @DecimalMin("0.00") @DecimalMax("999999.00") BigDecimal dailyWage,
        @Pattern(regexp = "^[0-9]{10}$") String contact,
        @Email String email,
        @Size(max = 240) String address,
        @Size(max = 100) String upiId
    ) {}

    @GetMapping
    public ResponseEntity<?> list(Authentication a) {
        List<Worker> list = repo.findAllByFarmerIdOrderByCreatedAtDesc(owner(a));
        BigDecimal grandTotal = list.stream()
            .map(Worker::getPaymentAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return ResponseEntity.ok(Map.of("success", true, "data", list, "grandTotal", grandTotal));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Request r, Authentication a) {
        Worker saved = repo.save(new Worker(
            owner(a),
            r.name(),
            r.daysWorked(),
            r.dailyWage(),
            r.contact(),
            r.email(),
            r.address(),
            r.upiId()
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @Valid @RequestBody Request r, Authentication a) {
        Worker w = repo.findByIdAndFarmerId(id, owner(a)).orElseThrow(NoSuchElementException::new);
        w.update(
            r.name(),
            r.daysWorked(),
            r.dailyWage(),
            r.contact(),
            r.email(),
            r.address(),
            r.upiId()
        );
        Worker saved = repo.save(w);
        return ResponseEntity.ok(Map.of("success", true, "data", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id, Authentication a) {
        Worker w = repo.findByIdAndFarmerId(id, owner(a)).orElseThrow(NoSuchElementException::new);
        repo.delete(w);
        return ResponseEntity.ok(Map.of("success", true, "message", "Worker deleted"));
    }

    private String owner(Authentication a) {
        return users.findByEmailIgnoreCase(a.getName()).orElseThrow().getId();
    }
}
