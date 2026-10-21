package in.kisankhata.farm;

import in.kisankhata.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/farmer/expenses")
public class ExpenseController {

    private final ExpenseRepository expenses;
    private final CropRepository crops;
    private final UserRepository users;

    public ExpenseController(ExpenseRepository expenses, CropRepository crops, UserRepository users) {
        this.expenses = expenses;
        this.crops = crops;
        this.users = users;
    }

    public record Request(
        @NotBlank String cropId,
        @NotNull @DecimalMin("0.01") @DecimalMax("9999999.00") BigDecimal amount,
        @NotBlank @Size(max = 80) String category,
        @Size(max = 500) String details,
        @NotNull LocalDate expenseDate
    ) {}

    @GetMapping
    public ResponseEntity<?> list(
        @RequestParam(required = false) String cropId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        Authentication a
    ) {
        String farmerId = owner(a);
        List<Expense> list;
        if (cropId != null && !cropId.isBlank()) {
            list = expenses.findAllByFarmerIdAndCropIdOrderByExpenseDateDesc(farmerId, cropId.trim());
        } else if (from != null && to != null) {
            list = expenses.findAllByFarmerIdAndExpenseDateBetweenOrderByExpenseDateDesc(farmerId, from, to);
        } else {
            list = expenses.findAllByFarmerIdOrderByExpenseDateDesc(farmerId);
        }

        BigDecimal total = list.stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(Map.of("success", true, "data", list, "total", total));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Request r, Authentication a) {
        String farmerId = owner(a);
        crops.findByIdAndFarmerId(r.cropId(), farmerId).orElseThrow(() -> new NoSuchElementException("Crop not found"));
        Expense saved = expenses.save(new Expense(farmerId, r.cropId(), r.amount(), r.category(), r.details(), r.expenseDate()));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @Valid @RequestBody Request r, Authentication a) {
        String farmerId = owner(a);
        Expense exp = expenses.findByIdAndFarmerId(id, farmerId).orElseThrow(() -> new NoSuchElementException("Expense not found"));
        crops.findByIdAndFarmerId(r.cropId(), farmerId).orElseThrow(() -> new NoSuchElementException("Crop not found"));

        exp.update(r.cropId(), r.amount(), r.category(), r.details(), r.expenseDate());
        Expense saved = expenses.save(exp);
        return ResponseEntity.ok(Map.of("success", true, "data", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id, Authentication a) {
        String farmerId = owner(a);
        Expense exp = expenses.findByIdAndFarmerId(id, farmerId).orElseThrow(NoSuchElementException::new);
        expenses.delete(exp);
        return ResponseEntity.ok(Map.of("success", true, "message", "Expense deleted"));
    }

    private String owner(Authentication a) {
        return users.findByEmailIgnoreCase(a.getName()).orElseThrow().getId();
    }
}
