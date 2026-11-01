package in.kisankhata.farm;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface FarmRecordRepository extends JpaRepository<FarmRecord, String> {
    List<FarmRecord> findAllByFarmerId(String farmerId);
    List<FarmRecord> findAllByFarmerIdAndRecordTypeOrderByRecordDateDesc(String farmerId, FarmRecord.RecordType type);
    Optional<FarmRecord> findByIdAndFarmerIdAndRecordType(String id, String farmerId, FarmRecord.RecordType type);
}
