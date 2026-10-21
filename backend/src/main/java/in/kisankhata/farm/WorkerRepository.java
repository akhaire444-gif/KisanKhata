package in.kisankhata.farm;
import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface WorkerRepository extends JpaRepository<Worker,String>{List<Worker> findAllByFarmerIdOrderByCreatedAtDesc(String farmerId);Optional<Worker> findByIdAndFarmerId(String id,String farmerId);}
