package in.kisankhata.farm;

import in.kisankhata.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/farmer")
public class FarmRecordController {

    private final FarmRecordRepository repo;
    private final UserRepository users;

    public FarmRecordController(FarmRecordRepository repo, UserRepository users) {
        this.repo = repo;
        this.users = users;
    }

    public record WaterRequest(
        String name,
        String plotName,
        String plot,
        Boolean withFertilizer,
        Boolean fertilizerUsed,
        String quantity,
        String unit,
        LocalDate date,
        LocalDate recordDate,
        String description
    ) {}

    public record InputRequest(
        String name,
        String plotName,
        String plot,
        String productName,
        String product,
        String quantity,
        String unit,
        LocalDate date,
        LocalDate recordDate,
        String description
    ) {}

    public record ReminderRequest(
        String name,
        @NotBlank @Size(max = 500) String description,
        LocalDate date,
        LocalDate reminderDate,
        String time,
        String reminderTime
    ) {}

    // 1. Water Records
    @GetMapping("/water-records")
    public ResponseEntity<?> waterList(Authentication a) {
        List<FarmRecord> list = repo.findAllByFarmerIdAndRecordTypeOrderByRecordDateDesc(owner(a), FarmRecord.RecordType.WATER);
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }

    @PostMapping("/water-records")
    public ResponseEntity<?> addWater(@Valid @RequestBody WaterRequest r, Authentication a) {
        String pName = firstNonBlank(r.plotName(), r.plot(), "Main Plot");
        String qty = r.quantity() != null ? (r.quantity() + (r.unit() != null ? " " + r.unit() : "")) : "";
        Boolean fert = r.withFertilizer() != null ? r.withFertilizer() : (r.fertilizerUsed() != null ? r.fertilizerUsed() : false);
        LocalDate recDate = r.date() != null ? r.date() : (r.recordDate() != null ? r.recordDate() : LocalDate.now());
        String name = firstNonBlank(r.name(), pName + " Irrigation");

        FarmRecord saved = repo.save(new FarmRecord(
            owner(a),
            FarmRecord.RecordType.WATER,
            name,
            r.description(),
            pName,
            null,
            qty,
            fert,
            recDate,
            null,
            null
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", saved));
    }

    @DeleteMapping("/water-records/{id}")
    public ResponseEntity<?> deleteWater(@PathVariable String id, Authentication a) {
        deleteRecord(id, a, FarmRecord.RecordType.WATER);
        return ResponseEntity.ok(Map.of("success", true, "message", "Water record deleted"));
    }

    // 2. Input Records
    @GetMapping("/input-records")
    public ResponseEntity<?> inputList(Authentication a) {
        List<FarmRecord> list = repo.findAllByFarmerIdAndRecordTypeOrderByRecordDateDesc(owner(a), FarmRecord.RecordType.INPUT);
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }

    @PostMapping("/input-records")
    public ResponseEntity<?> addInput(@Valid @RequestBody InputRequest r, Authentication a) {
        String pName = firstNonBlank(r.plotName(), r.plot(), "Main Plot");
        String prod = firstNonBlank(r.productName(), r.product(), "Fertilizer / Pesticide");
        String qty = r.quantity() != null ? (r.quantity() + (r.unit() != null ? " " + r.unit() : "")) : "";
        LocalDate recDate = r.date() != null ? r.date() : (r.recordDate() != null ? r.recordDate() : LocalDate.now());
        String name = firstNonBlank(r.name(), prod + " Application");

        FarmRecord saved = repo.save(new FarmRecord(
            owner(a),
            FarmRecord.RecordType.INPUT,
            name,
            r.description(),
            pName,
            prod,
            qty,
            true,
            recDate,
            null,
            null
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", saved));
    }

    @DeleteMapping("/input-records/{id}")
    public ResponseEntity<?> deleteInput(@PathVariable String id, Authentication a) {
        deleteRecord(id, a, FarmRecord.RecordType.INPUT);
        return ResponseEntity.ok(Map.of("success", true, "message", "Input record deleted"));
    }

    // 3. Reminders
    @GetMapping("/reminders")
    public ResponseEntity<?> reminderList(Authentication a) {
        List<FarmRecord> list = repo.findAllByFarmerIdAndRecordTypeOrderByRecordDateDesc(owner(a), FarmRecord.RecordType.REMINDER);
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }

    @PostMapping("/reminders")
    public ResponseEntity<?> addReminder(@Valid @RequestBody ReminderRequest r, Authentication a) {
        LocalDate rDate = r.reminderDate() != null ? r.reminderDate() : r.date();
        String rTime = r.reminderTime() != null ? r.reminderTime() : r.time();

        if (rDate == null || rTime == null || rTime.isBlank()) {
            throw new IllegalArgumentException("Reminder date and time are required");
        }

        LocalTime parsedTime;
        try {
            parsedTime = LocalTime.parse(rTime.trim());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid time format. Please use HH:mm");
        }

        LocalDateTime reminderDateTime = LocalDateTime.of(rDate, parsedTime);
        if (reminderDateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Choose a future date and time");
        }

        String name = firstNonBlank(r.name(), r.description());

        FarmRecord saved = repo.save(new FarmRecord(
            owner(a),
            FarmRecord.RecordType.REMINDER,
            name,
            r.description(),
            null,
            null,
            null,
            null,
            rDate,
            rDate,
            rTime.trim()
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", saved));
    }

    @PatchMapping({"/reminders/{id}/toggle", "/reminders/{id}/done"})
    public ResponseEntity<?> toggleReminder(@PathVariable String id, Authentication a) {
        FarmRecord r = repo.findByIdAndFarmerIdAndRecordType(id, owner(a), FarmRecord.RecordType.REMINDER)
            .orElseThrow(NoSuchElementException::new);
        r.setDone(!r.isDone());
        FarmRecord saved = repo.save(r);
        return ResponseEntity.ok(Map.of("success", true, "data", saved));
    }

    @DeleteMapping("/reminders/{id}")
    public ResponseEntity<?> deleteReminder(@PathVariable String id, Authentication a) {
        deleteRecord(id, a, FarmRecord.RecordType.REMINDER);
        return ResponseEntity.ok(Map.of("success", true, "message", "Reminder deleted"));
    }

    private void deleteRecord(String id, Authentication a, FarmRecord.RecordType type) {
        FarmRecord r = repo.findByIdAndFarmerIdAndRecordType(id, owner(a), type).orElseThrow(NoSuchElementException::new);
        repo.delete(r);
    }

    private String owner(Authentication a) {
        return users.findByEmailIgnoreCase(a.getName()).orElseThrow().getId();
    }

    private String firstNonBlank(String... values) {
        if (values == null) return "";
        for (String v : values) {
            if (v != null && !v.isBlank()) return v.trim();
        }
        return "";
    }
}
