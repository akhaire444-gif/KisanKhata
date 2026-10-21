package in.kisankhata.farm;
import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface CropRepository extends JpaRepository<Crop,String> {
 List<Crop> findAllByFarmerIdOrderByCreatedAtDesc(String farmerId);
 boolean existsByFarmerIdAndNameIgnoreCaseAndPlantationDate(String farmerId,String name,java.time.LocalDate date);
 Optional<Crop> findByIdAndFarmerId(String id,String farmerId);
}
