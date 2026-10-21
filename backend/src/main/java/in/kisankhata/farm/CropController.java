package in.kisankhata.farm;

import in.kisankhata.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/farmer/crops")
public class CropController {

    private final CropRepository crops;
    private final ExpenseRepository expenses;
    private final UserRepository users;

    public CropController(CropRepository crops, ExpenseRepository expenses, UserRepository users) {
        this.crops = crops;
        this.expenses = expenses;
        this.users = users;
    }

    public record CropRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 80) String category,
        @NotNull LocalDate plantationDate,
        @Min(1) @Max(5000) Integer durationDays,
        @Size(max = 500) String description
    ) {}

    @GetMapping
    public ResponseEntity<?> list(Authentication a) {
        List<Crop> list = crops.findAllByFarmerIdOrderByCreatedAtDesc(owner(a));
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CropRequest r, Authentication a) {
        String farmerId = owner(a);
        String trimmedName = r.name().trim();
        if (crops.existsByFarmerIdAndNameIgnoreCaseAndPlantationDate(farmerId, trimmedName, r.plantationDate())) {
            throw new IllegalArgumentException("This crop is already added");
        }
        Crop saved = crops.save(new Crop(farmerId, trimmedName, r.category(), r.plantationDate(), r.durationDays(), r.description()));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @Valid @RequestBody CropRequest r, Authentication a) {
        String farmerId = owner(a);
        Crop crop = crops.findByIdAndFarmerId(id, farmerId).orElseThrow(NoSuchElementException::new);

        String trimmedName = r.name().trim();
        boolean nameChanged = !crop.getName().equalsIgnoreCase(trimmedName);
        boolean dateChanged = !crop.getPlantationDate().equals(r.plantationDate());
        if ((nameChanged || dateChanged) && crops.existsByFarmerIdAndNameIgnoreCaseAndPlantationDate(farmerId, trimmedName, r.plantationDate())) {
            throw new IllegalArgumentException("This crop is already added");
        }

        crop.update(trimmedName, r.category(), r.plantationDate(), r.durationDays(), r.description());
        Crop saved = crops.save(crop);
        return ResponseEntity.ok(Map.of("success", true, "data", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id, Authentication a) {
        String farmerId = owner(a);
        Crop c = crops.findByIdAndFarmerId(id, farmerId).orElseThrow(NoSuchElementException::new);
        if (expenses.existsByCropIdAndFarmerId(id, farmerId)) {
            throw new IllegalArgumentException("This crop has expenses. Delete those expenses first.");
        }
        crops.delete(c);
        return ResponseEntity.ok(Map.of("success", true, "message", "Crop deleted"));
    }

    private String owner(Authentication a) {
        return users.findByEmailIgnoreCase(a.getName()).orElseThrow().getId();
    }
}
