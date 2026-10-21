package in.kisankhata.mart;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findAllByActiveTrueOrderByCreatedAtDesc();
    Optional<Product> findByIdAndActiveTrue(String id);
    List<Product> findAllByOrderByCreatedAtDesc();

    @Modifying
    @Query("UPDATE Product p SET p.stockQuantity = p.stockQuantity - :qty, p.updatedAt = CURRENT_INSTANT WHERE p.id = :id AND p.stockQuantity >= :qty")
    int atomicDeductStock(@Param("id") String id, @Param("qty") int qty);
}
