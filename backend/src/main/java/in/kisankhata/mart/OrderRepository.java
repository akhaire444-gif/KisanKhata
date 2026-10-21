package in.kisankhata.mart;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findAllByBuyerIdOrderByCreatedAtDesc(String buyerId);
    Optional<Order> findByIdAndBuyerId(String id, String buyerId);
    Optional<Order> findByBillNumber(String billNumber);
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findAllByStatusOrderByCreatedAtDesc(OrderStatus status);
}
