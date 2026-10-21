package in.kisankhata.farm;

import in.kisankhata.user.UserRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/farmer/reports")
public class ReportController {

    private final CropRepository crops;
    private final ExpenseRepository expenses;
    private final WorkerRepository workers;
    private final UserRepository users;

    public ReportController(CropRepository crops, ExpenseRepository expenses, WorkerRepository workers, UserRepository users) {
        this.crops = crops;
        this.expenses = expenses;
        this.workers = workers;
        this.users = users;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> summary(Authentication a) {
        String id = owner(a);
        List<Crop> cropList = crops.findAllByFarmerIdOrderByCreatedAtDesc(id);
        List<Expense> expenseList = expenses.findAllByFarmerIdOrderByExpenseDateDesc(id);
        List<Worker> workerList = workers.findAllByFarmerIdOrderByCreatedAtDesc(id);

        BigDecimal totalExpenses = expenseList.stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalWorkerWages = workerList.stream()
            .map(Worker::getPaymentAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> data = Map.of(
            "cropCount", cropList.size(),
            "expenseCount", expenseList.size(),
            "totalExpenses", totalExpenses,
            "workerCount", workerList.size(),
            "totalWorkerWages", totalWorkerWages
        );

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/date-wise")
    public ResponseEntity<?> dateWise(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        Authentication a
    ) {
        String id = owner(a);
        List<Expense> list;
        if (from != null && to != null) {
            list = expenses.findAllByFarmerIdAndExpenseDateBetweenOrderByExpenseDateDesc(id, from, to);
        } else {
            list = expenses.findAllByFarmerIdOrderByExpenseDateDesc(id);
        }

        BigDecimal totalAmount = list.stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", list,
            "totalAmount", totalAmount
        ));
    }

    @GetMapping("/crop-wise")
    public ResponseEntity<?> cropWise(@RequestParam String cropId, Authentication a) {
        String id = owner(a);
        if (cropId == null || cropId.isBlank()) {
            throw new IllegalArgumentException("cropId parameter is required");
        }
        Crop crop = crops.findByIdAndFarmerId(cropId.trim(), id)
            .orElseThrow(() -> new NoSuchElementException("Crop not found"));

        List<Expense> list = expenses.findAllByFarmerIdAndCropIdOrderByExpenseDateDesc(id, cropId.trim());
        BigDecimal totalAmount = list.stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "crop", crop,
            "expenses", list,
            "totalAmount", totalAmount
        ));
    }

    @GetMapping("/worker-wise")
    public ResponseEntity<?> workerWise(Authentication a) {
        String id = owner(a);
        List<Worker> list = workers.findAllByFarmerIdOrderByCreatedAtDesc(id);
        BigDecimal grandTotalWage = list.stream()
            .map(Worker::getPaymentAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "workers", list,
            "grandTotalWage", grandTotalWage
        ));
    }

    private String owner(Authentication a) {
        return users.findByEmailIgnoreCase(a.getName()).orElseThrow().getId();
    }
}
