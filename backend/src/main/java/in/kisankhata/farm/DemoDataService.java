package in.kisankhata.farm;

import in.kisankhata.user.AppUser;
import in.kisankhata.user.Role;
import in.kisankhata.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class DemoDataService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataService.class);

    public static final String DEMO_EMAIL = "demo.farmer@kisankhata.in";
    public static final String DEMO_FIRST_NAME = "Demo";
    public static final String DEMO_LAST_NAME = "Farmer";
    public static final String DEMO_FARM_NAME = "Green Valley Demonstration Farm";
    public static final String DEMO_ADDRESS = "Sinnar, Nashik";
    public static final String DEMO_CITY = "Nashik";
    public static final String DEMO_PIN_CODE = "422103";
    public static final String DEMO_STATE = "Maharashtra";
    public static final String DEMO_MOBILE = "9876543210";

    private final UserRepository userRepo;
    private final CropRepository cropRepo;
    private final ExpenseRepository expenseRepo;
    private final WorkerRepository workerRepo;
    private final FarmRecordRepository farmRecordRepo;
    private final PasswordEncoder encoder;

    public DemoDataService(
        UserRepository userRepo,
        CropRepository cropRepo,
        ExpenseRepository expenseRepo,
        WorkerRepository workerRepo,
        FarmRecordRepository farmRecordRepo,
        PasswordEncoder encoder
    ) {
        this.userRepo = userRepo;
        this.cropRepo = cropRepo;
        this.expenseRepo = expenseRepo;
        this.workerRepo = workerRepo;
        this.farmRecordRepo = farmRecordRepo;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        try {
            ensureDemoDataInitialized();
        } catch (Exception ex) {
            log.error("Failed to initialize demo tenant on startup", ex);
        }
    }

    @Transactional
    public AppUser ensureDemoDataInitialized() {
        AppUser demoUser = userRepo.findByEmailIgnoreCase(DEMO_EMAIL).orElseGet(() -> {
            log.info("Creating dedicated Demo Farmer user ({})", DEMO_EMAIL);
            return userRepo.save(new AppUser(
                DEMO_FIRST_NAME,
                DEMO_LAST_NAME,
                DEMO_EMAIL,
                DEMO_MOBILE,
                encoder.encode(UUID.randomUUID().toString()),
                Role.FARMER,
                DEMO_FARM_NAME,
                DEMO_ADDRESS,
                DEMO_CITY,
                DEMO_PIN_CODE,
                DEMO_STATE
            ));
        });

        // If crops are empty, seed sample data
        if (cropRepo.findAllByFarmerIdOrderByCreatedAtDesc(demoUser.getId()).isEmpty()) {
            log.info("Seeding initial agricultural data for Demo Farmer");
            populateSampleData(demoUser.getId());
        }

        return demoUser;
    }

    @Transactional
    public AppUser resetDemoData() {
        AppUser demoUser = ensureDemoDataInitialized();
        String demoId = demoUser.getId();

        log.info("Resetting demo tenant data for id {}", demoId);

        // Strict tenant isolation: Delete only records belonging to the demo farmer
        expenseRepo.deleteAll(expenseRepo.findAllByFarmerIdOrderByExpenseDateDesc(demoId));
        cropRepo.deleteAll(cropRepo.findAllByFarmerIdOrderByCreatedAtDesc(demoId));
        workerRepo.deleteAll(workerRepo.findAllByFarmerIdOrderByCreatedAtDesc(demoId));
        farmRecordRepo.deleteAll(farmRecordRepo.findAllByFarmerId(demoId));

        populateSampleData(demoId);

        return demoUser;
    }

    private void populateSampleData(String demoId) {
        LocalDate today = LocalDate.now();

        // 1. Crops
        Crop grapes = cropRepo.save(new Crop(
            demoId,
            "Table Grapes (Nashik Thompson)",
            "Fruit",
            today.minusDays(110),
            150,
            "Export-quality Thompson seedless vineyard in Sinnar belt"
        ));

        Crop onion = cropRepo.save(new Crop(
            demoId,
            "Red Onion (Gavran)",
            "Vegetables",
            today.minusDays(65),
            90,
            "High pungent storage variety Kharif onion"
        ));

        Crop soybean = cropRepo.save(new Crop(
            demoId,
            "Soybean (JS-335)",
            "Oilseeds",
            today.minusDays(80),
            100,
            "Certified breeder seed plot"
        ));

        Crop pomegranate = cropRepo.save(new Crop(
            demoId,
            "Pomegranate (Bhagwa)",
            "Fruit",
            today.minusDays(140),
            180,
            "High-density drip fertigated orchard"
        ));

        // 2. Agricultural Expenses across categories
        expenseRepo.saveAll(List.of(
            new Expense(
                demoId,
                onion.getId(),
                new BigDecimal("12500.00"),
                "Seeds",
                "Certified Gavran onion seed packets (5 kg)",
                today.minusDays(64)
            ),
            new Expense(
                demoId,
                grapes.getId(),
                new BigDecimal("18400.00"),
                "Fertilizers",
                "10:26:26 NPK & water-soluble sulphate of potash (10 bags)",
                today.minusDays(50)
            ),
            new Expense(
                demoId,
                grapes.getId(),
                new BigDecimal("6800.00"),
                "Pesticides & Sprays",
                "Organic Neem oil spray & bio-fungicide for downy mildew",
                today.minusDays(35)
            ),
            new Expense(
                demoId,
                soybean.getId(),
                new BigDecimal("14200.00"),
                "Tractor & Diesel",
                "Summer deep ploughing, rotavator bed preparation and diesel fuel",
                today.minusDays(78)
            ),
            new Expense(
                demoId,
                grapes.getId(),
                new BigDecimal("22500.00"),
                "Labour",
                "Vineyard canopy pruning, shoot positioning, and manual thinning crew",
                today.minusDays(28)
            ),
            new Expense(
                demoId,
                onion.getId(),
                new BigDecimal("16000.00"),
                "Crop Cutting / Harvesting",
                "Onion harvest lifting, field curing, and sorting labour",
                today.minusDays(12)
            ),
            new Expense(
                demoId,
                onion.getId(),
                new BigDecimal("5500.00"),
                "Transport",
                "Mini-truck transport freight to Nashik APMC Yard",
                today.minusDays(10)
            ),
            new Expense(
                demoId,
                pomegranate.getId(),
                new BigDecimal("4800.00"),
                "Other",
                "Drip irrigation lateral pipe maintenance and micro-emitters replacement",
                today.minusDays(20)
            )
        ));

        // 3. Workers (at least 5 sample workers)
        workerRepo.saveAll(List.of(
            new Worker(
                demoId,
                "Rameshwar Chavan",
                22,
                new BigDecimal("400.00"),
                "9822011221",
                "rameshwar.chavan@kisankhata.demo",
                "Sinnar Rural",
                "ramesh.chavan@upi"
            ),
            new Worker(
                demoId,
                "Sunita Tai Patil",
                25,
                new BigDecimal("350.00"),
                "9822033442",
                "sunita.patil@kisankhata.demo",
                "Wavi Village",
                "sunita.patil@okhdfcbank"
            ),
            new Worker(
                demoId,
                "Bhaskar Rao Gite",
                18,
                new BigDecimal("450.00"),
                "9822055663",
                "bhaskar.gite@kisankhata.demo",
                "Dodi Budruk",
                "bhaskar.gite@oksbi"
            ),
            new Worker(
                demoId,
                "Anita Dnyaneshwar Wagh",
                20,
                new BigDecimal("350.00"),
                "9822077884",
                "anita.wagh@kisankhata.demo",
                "Musgaon",
                "anita.wagh@paytm"
            ),
            new Worker(
                demoId,
                "Datta Tukaram Shinde",
                15,
                new BigDecimal("500.00"),
                "9822099005",
                "datta.shinde@kisankhata.demo",
                "Pangri",
                "datta.shinde@apl"
            ),
            new Worker(
                demoId,
                "Kailas Baburao Sanap",
                12,
                new BigDecimal("450.00"),
                "9822088116",
                "kailas.sanap@kisankhata.demo",
                "Kondgaon",
                "kailas.sanap@upi"
            )
        ));

        // 4. Farm Operations & Reminders
        farmRecordRepo.saveAll(List.of(
            new FarmRecord(
                demoId,
                FarmRecord.RecordType.WATER,
                "Vineyard Drip Irrigation",
                "4 hours drip irrigation with morning cycle",
                "Plot A - Grapes",
                null,
                "4 Hours",
                true,
                today.minusDays(2),
                null,
                null
            ),
            new FarmRecord(
                demoId,
                FarmRecord.RecordType.WATER,
                "Onion Furrow Irrigation",
                "Evening light watering before fertilizer top-dress",
                "Plot B - Onion",
                null,
                "3 Hours",
                false,
                today.minusDays(5),
                null,
                null
            ),
            new FarmRecord(
                demoId,
                FarmRecord.RecordType.INPUT,
                "19:19:19 Fertigation",
                "Water soluble foliar application for vegetative growth",
                "Plot A - Grapes",
                "19:19:19 NPK Soluble",
                "25 kg",
                true,
                today.minusDays(7),
                null,
                null
            ),
            new FarmRecord(
                demoId,
                FarmRecord.RecordType.INPUT,
                "Boron Micronutrient Spray",
                "Fruit setting and flower drop prevention spray",
                "Plot C - Pomegranate",
                "Chelated Boron 20%",
                "5 Litres",
                false,
                today.minusDays(14),
                null,
                null
            ),
            new FarmRecord(
                demoId,
                FarmRecord.RecordType.REMINDER,
                "Apply bio-fungicide spray before evening",
                "Check weather humidity and spray Trichoderma / bio-fungicide on vines",
                null,
                null,
                null,
                null,
                today,
                today,
                "16:30"
            ),
            new FarmRecord(
                demoId,
                FarmRecord.RecordType.REMINDER,
                "Inspect drip sand filter and backwash",
                "Clean disc filter mesh to ensure uniform emitter discharge pressure",
                null,
                null,
                null,
                null,
                today.plusDays(1),
                today.plusDays(1),
                "08:00"
            ),
            new FarmRecord(
                demoId,
                FarmRecord.RecordType.REMINDER,
                "Weekly worker wage rozi payment distribution",
                "Disburse pending weekly wage payments to farm labourers",
                null,
                null,
                null,
                null,
                today.plusDays(5),
                today.plusDays(5),
                "18:00"
            )
        ));

        log.info("Successfully populated realistic agricultural sample data for Demo Farmer");
    }
}

