package in.kisankhata.farm;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, String> {
    List<Expense> findAllByFarmerIdOrderByExpenseDateDesc(String farmerId);
    List<Expense> findAllByFarmerIdAndCropIdOrderByExpenseDateDesc(String farmerId, String cropId);
    List<Expense> findAllByFarmerIdAndExpenseDateBetweenOrderByExpenseDateDesc(String farmerId, LocalDate from, LocalDate to);
    boolean existsByCropIdAndFarmerId(String cropId, String farmerId);
    Optional<Expense> findByIdAndFarmerId(String id, String farmerId);
}
