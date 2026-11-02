package in.kisankhata.config;

import in.kisankhata.farm.CropRepository;
import in.kisankhata.farm.ExpenseRepository;
import in.kisankhata.farm.FarmRecordRepository;
import in.kisankhata.farm.WorkerRepository;
import in.kisankhata.mart.CartItemRepository;
import in.kisankhata.mart.OrderItemRepository;
import in.kisankhata.mart.OrderRepository;
import in.kisankhata.user.AppUser;
import in.kisankhata.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DemoCleanupRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoCleanupRunner.class);
    private static final String DEMO_EMAIL = "demo.farmer@kisankhata.in";

    private final UserRepository userRepo;
    private final CropRepository cropRepo;
    private final ExpenseRepository expenseRepo;
    private final WorkerRepository workerRepo;
    private final FarmRecordRepository farmRecordRepo;
    private final CartItemRepository cartItemRepo;
    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;

    public DemoCleanupRunner(
        UserRepository userRepo,
        CropRepository cropRepo,
        ExpenseRepository expenseRepo,
        WorkerRepository workerRepo,
        FarmRecordRepository farmRecordRepo,
        CartItemRepository cartItemRepo,
        OrderRepository orderRepo,
        OrderItemRepository orderItemRepo
    ) {
        this.userRepo = userRepo;
        this.cropRepo = cropRepo;
        this.expenseRepo = expenseRepo;
        this.workerRepo = workerRepo;
        this.farmRecordRepo = farmRecordRepo;
        this.cartItemRepo = cartItemRepo;
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
    }

    @Override
    @Transactional
    public void run(String... args) {
        userRepo.findByEmailIgnoreCase(DEMO_EMAIL).ifPresent(demoUser -> {
            String demoId = demoUser.getId();
            log.info("Performing one-time cleanup of obsolete demo user ({}) and associated data", DEMO_EMAIL);

            try {
                // 1. Delete cart items
                cartItemRepo.deleteAllByBuyerId(demoId);

                // 2. Delete orders and items
                var orders = orderRepo.findAllByBuyerIdOrderByCreatedAtDesc(demoId);
                for (var order : orders) {
                    var items = orderItemRepo.findAllByOrderId(order.getId());
                    orderItemRepo.deleteAll(items);
                }
                orderRepo.deleteAll(orders);

                // 3. Delete farm records
                var records = farmRecordRepo.findAllByFarmerId(demoId);
                farmRecordRepo.deleteAll(records);

                // 4. Delete expenses
                var expenses = expenseRepo.findAllByFarmerIdOrderByExpenseDateDesc(demoId);
                expenseRepo.deleteAll(expenses);

                // 5. Delete workers
                var workers = workerRepo.findAllByFarmerIdOrderByCreatedAtDesc(demoId);
                workerRepo.deleteAll(workers);

                // 6. Delete crops
                var crops = cropRepo.findAllByFarmerIdOrderByCreatedAtDesc(demoId);
                cropRepo.deleteAll(crops);

                // 7. Delete the demo user
                userRepo.delete(demoUser);

                log.info("Obsolete demo user ({}) and all associated records deleted successfully.", DEMO_EMAIL);
            } catch (Exception ex) {
                log.error("Failed to clean up obsolete demo user data on startup", ex);
            }
        });
    }
}

