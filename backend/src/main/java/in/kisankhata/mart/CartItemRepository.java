package in.kisankhata.mart;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, String> {
    List<CartItem> findAllByBuyerIdOrderByCreatedAtDesc(String buyerId);
    Optional<CartItem> findByBuyerIdAndProductId(String buyerId, String productId);
    Optional<CartItem> findByIdAndBuyerId(String id, String buyerId);
    void deleteAllByBuyerId(String buyerId);
}
