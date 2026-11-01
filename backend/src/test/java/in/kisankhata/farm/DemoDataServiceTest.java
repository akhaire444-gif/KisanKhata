package in.kisankhata.farm;

import in.kisankhata.user.AppUser;
import in.kisankhata.user.Role;
import in.kisankhata.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

public class DemoDataServiceTest {

    private InMemoryUserRepository userRepo;
    private InMemoryCropRepository cropRepo;
    private InMemoryExpenseRepository expenseRepo;
    private InMemoryWorkerRepository workerRepo;
    private InMemoryFarmRecordRepository farmRecordRepo;
    private DummyPasswordEncoder encoder;
    private DemoDataService service;

    @BeforeEach
    void setUp() {
        userRepo = new InMemoryUserRepository();
        cropRepo = new InMemoryCropRepository();
        expenseRepo = new InMemoryExpenseRepository();
        workerRepo = new InMemoryWorkerRepository();
        farmRecordRepo = new InMemoryFarmRecordRepository();
        encoder = new DummyPasswordEncoder();
        service = new DemoDataService(userRepo, cropRepo, expenseRepo, workerRepo, farmRecordRepo, encoder);
    }

    @Test
    @DisplayName("ensureDemoDataInitialized creates demo user and seeds realistic sample farm data")
    void testEnsureDemoDataInitialized() {
        AppUser demoUser = service.ensureDemoDataInitialized();

        assertThat(demoUser).isNotNull();
        assertThat(demoUser.getEmail()).isEqualTo(DemoDataService.DEMO_EMAIL);
        assertThat(demoUser.getFarmName()).isEqualTo(DemoDataService.DEMO_FARM_NAME);
        assertThat(demoUser.getRole()).isEqualTo(Role.FARMER);

        String demoId = demoUser.getId();

        // Verify seeded crops
        List<Crop> crops = cropRepo.findAllByFarmerIdOrderByCreatedAtDesc(demoId);
        assertThat(crops).hasSize(4);

        // Verify seeded expenses across diverse categories
        List<Expense> expenses = expenseRepo.findAllByFarmerIdOrderByExpenseDateDesc(demoId);
        assertThat(expenses).hasSize(8);

        BigDecimal totalExpense = expenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(totalExpense).isGreaterThan(BigDecimal.valueOf(50000));

        // Verify at least 5 workers with realistic wages and days
        List<Worker> workers = workerRepo.findAllByFarmerIdOrderByCreatedAtDesc(demoId);
        assertThat(workers).hasSizeGreaterThanOrEqualTo(5);

        BigDecimal totalWages = workers.stream().map(Worker::getPaymentAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(totalWages).isGreaterThan(BigDecimal.valueOf(30000));

        // Verify farm records
        List<FarmRecord> farmRecords = farmRecordRepo.findAllByFarmerId(demoId);
        assertThat(farmRecords).hasSize(7);
    }

    @Test
    @DisplayName("resetDemoData restores sample data and maintains strict tenant isolation without touching other users")
    void testResetDemoDataTenantIsolation() {
        // 1. Initialize demo user
        AppUser demo = service.ensureDemoDataInitialized();
        String demoId = demo.getId();

        // 2. Add a real user with their own private crops and expenses
        AppUser realUser = new AppUser("Real", "Farmer", "real@farm.in", "9999999999", "pass", Role.FARMER, "Real Farm", "Nashik", "MH");
        userRepo.save(realUser);
        String realId = realUser.getId();

        Crop realCrop = new Crop(realId, "Private Sugarcane", "Cash Crop", LocalDate.now(), 365, "Confidential");
        cropRepo.save(realCrop);

        Expense realExpense = new Expense(realId, realCrop.getId(), BigDecimal.valueOf(50000), "Seeds", "Real seeds", LocalDate.now());
        expenseRepo.save(realExpense);

        Worker realWorker = new Worker(realId, "Real Worker 1", 10, BigDecimal.valueOf(500), "9123456789", null, null, null);
        workerRepo.save(realWorker);

        // 3. Reset demo data
        service.resetDemoData();

        // 4. Verify demo user has fresh seed data
        assertThat(cropRepo.findAllByFarmerIdOrderByCreatedAtDesc(demoId)).hasSize(4);
        assertThat(expenseRepo.findAllByFarmerIdOrderByExpenseDateDesc(demoId)).hasSize(8);
        assertThat(workerRepo.findAllByFarmerIdOrderByCreatedAtDesc(demoId)).hasSize(6);

        // 5. Verify real user's private data is 100% UNTOUCHED
        assertThat(cropRepo.findAllByFarmerIdOrderByCreatedAtDesc(realId)).hasSize(1);
        assertThat(cropRepo.findAllByFarmerIdOrderByCreatedAtDesc(realId).get(0).getName()).isEqualTo("Private Sugarcane");
        assertThat(expenseRepo.findAllByFarmerIdOrderByExpenseDateDesc(realId)).hasSize(1);
        assertThat(workerRepo.findAllByFarmerIdOrderByCreatedAtDesc(realId)).hasSize(1);
    }

    // In-memory test implementations for lightning-fast testing without dynamic agent attachment
    private static class InMemoryUserRepository implements UserRepository {
        private final Map<String, AppUser> map = new HashMap<>();
        @Override public Optional<AppUser> findByEmailIgnoreCase(String email) {
            return map.values().stream().filter(u -> u.getEmail().equalsIgnoreCase(email)).findFirst();
        }
        @Override public boolean existsByEmailIgnoreCase(String email) {
            return map.values().stream().anyMatch(u -> u.getEmail().equalsIgnoreCase(email));
        }
        public List<AppUser> findAllByRole(Role role) { return Collections.emptyList(); }
        public List<AppUser> findAllByOrderByCreatedAtDesc() { return new ArrayList<>(map.values()); }
        @Override public <S extends AppUser> S save(S entity) {
            if (entity.getId() == null) {
                try {
                    var f = AppUser.class.getDeclaredField("id");
                    f.setAccessible(true);
                    f.set(entity, UUID.randomUUID().toString());
                } catch (Exception ignored) {}
            }
            map.put(entity.getId(), entity);
            return entity;
        }
        @Override public <S extends AppUser> List<S> saveAll(Iterable<S> entities) { entities.forEach(this::save); return (List<S>) entities; }
        @Override public Optional<AppUser> findById(String s) { return Optional.ofNullable(map.get(s)); }
        @Override public boolean existsById(String s) { return map.containsKey(s); }
        @Override public List<AppUser> findAll() { return new ArrayList<>(map.values()); }
        @Override public List<AppUser> findAllById(Iterable<String> strings) { return Collections.emptyList(); }
        @Override public long count() { return map.size(); }
        @Override public void deleteById(String s) { map.remove(s); }
        @Override public void delete(AppUser entity) { map.remove(entity.getId()); }
        @Override public void deleteAllById(Iterable<? extends String> strings) {}
        @Override public void deleteAll(Iterable<? extends AppUser> entities) { entities.forEach(this::delete); }
        @Override public void deleteAll() { map.clear(); }
        @Override public void flush() {}
        @Override public <S extends AppUser> S saveAndFlush(S entity) { return save(entity); }
        @Override public <S extends AppUser> List<S> saveAllAndFlush(Iterable<S> entities) { return saveAll(entities); }
        @Override public void deleteAllInBatch(Iterable<AppUser> entities) {}
        @Override public void deleteAllByIdInBatch(Iterable<String> strings) {}
        @Override public void deleteAllInBatch() {}
        @Override public AppUser getOne(String s) { return map.get(s); }
        @Override public AppUser getById(String s) { return map.get(s); }
        @Override public AppUser getReferenceById(String s) { return map.get(s); }
        @Override public <S extends AppUser> Optional<S> findOne(org.springframework.data.domain.Example<S> example) { return Optional.empty(); }
        @Override public <S extends AppUser> List<S> findAll(org.springframework.data.domain.Example<S> example) { return Collections.emptyList(); }
        @Override public <S extends AppUser> List<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Sort sort) { return Collections.emptyList(); }
        @Override public <S extends AppUser> org.springframework.data.domain.Page<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public <S extends AppUser> long count(org.springframework.data.domain.Example<S> example) { return 0; }
        @Override public <S extends AppUser> boolean exists(org.springframework.data.domain.Example<S> example) { return false; }
        @Override public <S extends AppUser, R> R findBy(org.springframework.data.domain.Example<S> example, java.util.function.Function<org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public List<AppUser> findAll(org.springframework.data.domain.Sort sort) { return findAll(); }
        @Override public org.springframework.data.domain.Page<AppUser> findAll(org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
    }

    private static class InMemoryCropRepository implements CropRepository {
        private final Map<String, Crop> map = new HashMap<>();
        @Override public List<Crop> findAllByFarmerIdOrderByCreatedAtDesc(String farmerId) {
            return map.values().stream().filter(c -> c.getFarmerId().equals(farmerId)).toList();
        }
        @Override public boolean existsByFarmerIdAndNameIgnoreCaseAndPlantationDate(String farmerId, String name, LocalDate date) {
            return map.values().stream().anyMatch(c -> c.getFarmerId().equals(farmerId) && c.getName().equalsIgnoreCase(name) && c.getPlantationDate().equals(date));
        }
        @Override public Optional<Crop> findByIdAndFarmerId(String id, String farmerId) {
            Crop c = map.get(id);
            return c != null && c.getFarmerId().equals(farmerId) ? Optional.of(c) : Optional.empty();
        }
        @Override public <S extends Crop> S save(S entity) {
            if (entity.getId() == null) {
                try {
                    var f = Crop.class.getDeclaredField("id");
                    f.setAccessible(true);
                    f.set(entity, UUID.randomUUID().toString());
                } catch (Exception ignored) {}
            }
            map.put(entity.getId(), entity);
            return entity;
        }
        @Override public <S extends Crop> List<S> saveAll(Iterable<S> entities) { entities.forEach(this::save); return (List<S>) entities; }
        @Override public Optional<Crop> findById(String s) { return Optional.ofNullable(map.get(s)); }
        @Override public boolean existsById(String s) { return map.containsKey(s); }
        @Override public List<Crop> findAll() { return new ArrayList<>(map.values()); }
        @Override public List<Crop> findAllById(Iterable<String> strings) { return Collections.emptyList(); }
        @Override public long count() { return map.size(); }
        @Override public void deleteById(String s) { map.remove(s); }
        @Override public void delete(Crop entity) { map.remove(entity.getId()); }
        @Override public void deleteAllById(Iterable<? extends String> strings) {}
        @Override public void deleteAll(Iterable<? extends Crop> entities) { entities.forEach(this::delete); }
        @Override public void deleteAll() { map.clear(); }
        @Override public void flush() {}
        @Override public <S extends Crop> S saveAndFlush(S entity) { return save(entity); }
        @Override public <S extends Crop> List<S> saveAllAndFlush(Iterable<S> entities) { return saveAll(entities); }
        @Override public void deleteAllInBatch(Iterable<Crop> entities) {}
        @Override public void deleteAllByIdInBatch(Iterable<String> strings) {}
        @Override public void deleteAllInBatch() {}
        @Override public Crop getOne(String s) { return map.get(s); }
        @Override public Crop getById(String s) { return map.get(s); }
        @Override public Crop getReferenceById(String s) { return map.get(s); }
        @Override public <S extends Crop> Optional<S> findOne(org.springframework.data.domain.Example<S> example) { return Optional.empty(); }
        @Override public <S extends Crop> List<S> findAll(org.springframework.data.domain.Example<S> example) { return Collections.emptyList(); }
        @Override public <S extends Crop> List<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Sort sort) { return Collections.emptyList(); }
        @Override public <S extends Crop> org.springframework.data.domain.Page<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public <S extends Crop> long count(org.springframework.data.domain.Example<S> example) { return 0; }
        @Override public <S extends Crop> boolean exists(org.springframework.data.domain.Example<S> example) { return false; }
        @Override public <S extends Crop, R> R findBy(org.springframework.data.domain.Example<S> example, java.util.function.Function<org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public List<Crop> findAll(org.springframework.data.domain.Sort sort) { return findAll(); }
        @Override public org.springframework.data.domain.Page<Crop> findAll(org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
    }

    private static class InMemoryExpenseRepository implements ExpenseRepository {
        private final Map<String, Expense> map = new HashMap<>();
        @Override public List<Expense> findAllByFarmerIdOrderByExpenseDateDesc(String farmerId) {
            return map.values().stream().filter(e -> e.getFarmerId().equals(farmerId)).toList();
        }
        @Override public List<Expense> findAllByFarmerIdAndCropIdOrderByExpenseDateDesc(String farmerId, String cropId) {
            return map.values().stream().filter(e -> e.getFarmerId().equals(farmerId) && e.getCropId().equals(cropId)).toList();
        }
        @Override public List<Expense> findAllByFarmerIdAndExpenseDateBetweenOrderByExpenseDateDesc(String farmerId, LocalDate from, LocalDate to) {
            return map.values().stream().filter(e -> e.getFarmerId().equals(farmerId) && !e.getExpenseDate().isBefore(from) && !e.getExpenseDate().isAfter(to)).toList();
        }
        @Override public boolean existsByCropIdAndFarmerId(String cropId, String farmerId) {
            return map.values().stream().anyMatch(e -> e.getFarmerId().equals(farmerId) && e.getCropId().equals(cropId));
        }
        @Override public Optional<Expense> findByIdAndFarmerId(String id, String farmerId) {
            Expense e = map.get(id);
            return e != null && e.getFarmerId().equals(farmerId) ? Optional.of(e) : Optional.empty();
        }
        @Override public <S extends Expense> S save(S entity) {
            if (entity.getId() == null) {
                try {
                    var f = Expense.class.getDeclaredField("id");
                    f.setAccessible(true);
                    f.set(entity, UUID.randomUUID().toString());
                } catch (Exception ignored) {}
            }
            map.put(entity.getId(), entity);
            return entity;
        }
        @Override public <S extends Expense> List<S> saveAll(Iterable<S> entities) { entities.forEach(this::save); return (List<S>) entities; }
        @Override public Optional<Expense> findById(String s) { return Optional.ofNullable(map.get(s)); }
        @Override public boolean existsById(String s) { return map.containsKey(s); }
        @Override public List<Expense> findAll() { return new ArrayList<>(map.values()); }
        @Override public List<Expense> findAllById(Iterable<String> strings) { return Collections.emptyList(); }
        @Override public long count() { return map.size(); }
        @Override public void deleteById(String s) { map.remove(s); }
        @Override public void delete(Expense entity) { map.remove(entity.getId()); }
        @Override public void deleteAllById(Iterable<? extends String> strings) {}
        @Override public void deleteAll(Iterable<? extends Expense> entities) { entities.forEach(this::delete); }
        @Override public void deleteAll() { map.clear(); }
        @Override public void flush() {}
        @Override public <S extends Expense> S saveAndFlush(S entity) { return save(entity); }
        @Override public <S extends Expense> List<S> saveAllAndFlush(Iterable<S> entities) { return saveAll(entities); }
        @Override public void deleteAllInBatch(Iterable<Expense> entities) {}
        @Override public void deleteAllByIdInBatch(Iterable<String> strings) {}
        @Override public void deleteAllInBatch() {}
        @Override public Expense getOne(String s) { return map.get(s); }
        @Override public Expense getById(String s) { return map.get(s); }
        @Override public Expense getReferenceById(String s) { return map.get(s); }
        @Override public <S extends Expense> Optional<S> findOne(org.springframework.data.domain.Example<S> example) { return Optional.empty(); }
        @Override public <S extends Expense> List<S> findAll(org.springframework.data.domain.Example<S> example) { return Collections.emptyList(); }
        @Override public <S extends Expense> List<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Sort sort) { return Collections.emptyList(); }
        @Override public <S extends Expense> org.springframework.data.domain.Page<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public <S extends Expense> long count(org.springframework.data.domain.Example<S> example) { return 0; }
        @Override public <S extends Expense> boolean exists(org.springframework.data.domain.Example<S> example) { return false; }
        @Override public <S extends Expense, R> R findBy(org.springframework.data.domain.Example<S> example, java.util.function.Function<org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public List<Expense> findAll(org.springframework.data.domain.Sort sort) { return findAll(); }
        @Override public org.springframework.data.domain.Page<Expense> findAll(org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
    }

    private static class InMemoryWorkerRepository implements WorkerRepository {
        private final Map<String, Worker> map = new HashMap<>();
        @Override public List<Worker> findAllByFarmerIdOrderByCreatedAtDesc(String farmerId) {
            return map.values().stream().filter(w -> w.getFarmerId().equals(farmerId)).toList();
        }
        @Override public Optional<Worker> findByIdAndFarmerId(String id, String farmerId) {
            Worker w = map.get(id);
            return w != null && w.getFarmerId().equals(farmerId) ? Optional.of(w) : Optional.empty();
        }
        @Override public <S extends Worker> S save(S entity) {
            if (entity.getId() == null) {
                try {
                    var f = Worker.class.getDeclaredField("id");
                    f.setAccessible(true);
                    f.set(entity, UUID.randomUUID().toString());
                } catch (Exception ignored) {}
            }
            map.put(entity.getId(), entity);
            return entity;
        }
        @Override public <S extends Worker> List<S> saveAll(Iterable<S> entities) { entities.forEach(this::save); return (List<S>) entities; }
        @Override public Optional<Worker> findById(String s) { return Optional.ofNullable(map.get(s)); }
        @Override public boolean existsById(String s) { return map.containsKey(s); }
        @Override public List<Worker> findAll() { return new ArrayList<>(map.values()); }
        @Override public List<Worker> findAllById(Iterable<String> strings) { return Collections.emptyList(); }
        @Override public long count() { return map.size(); }
        @Override public void deleteById(String s) { map.remove(s); }
        @Override public void delete(Worker entity) { map.remove(entity.getId()); }
        @Override public void deleteAllById(Iterable<? extends String> strings) {}
        @Override public void deleteAll(Iterable<? extends Worker> entities) { entities.forEach(this::delete); }
        @Override public void deleteAll() { map.clear(); }
        @Override public void flush() {}
        @Override public <S extends Worker> S saveAndFlush(S entity) { return save(entity); }
        @Override public <S extends Worker> List<S> saveAllAndFlush(Iterable<S> entities) { return saveAll(entities); }
        @Override public void deleteAllInBatch(Iterable<Worker> entities) {}
        @Override public void deleteAllByIdInBatch(Iterable<String> strings) {}
        @Override public void deleteAllInBatch() {}
        @Override public Worker getOne(String s) { return map.get(s); }
        @Override public Worker getById(String s) { return map.get(s); }
        @Override public Worker getReferenceById(String s) { return map.get(s); }
        @Override public <S extends Worker> Optional<S> findOne(org.springframework.data.domain.Example<S> example) { return Optional.empty(); }
        @Override public <S extends Worker> List<S> findAll(org.springframework.data.domain.Example<S> example) { return Collections.emptyList(); }
        @Override public <S extends Worker> List<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Sort sort) { return Collections.emptyList(); }
        @Override public <S extends Worker> org.springframework.data.domain.Page<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public <S extends Worker> long count(org.springframework.data.domain.Example<S> example) { return 0; }
        @Override public <S extends Worker> boolean exists(org.springframework.data.domain.Example<S> example) { return false; }
        @Override public <S extends Worker, R> R findBy(org.springframework.data.domain.Example<S> example, java.util.function.Function<org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public List<Worker> findAll(org.springframework.data.domain.Sort sort) { return findAll(); }
        @Override public org.springframework.data.domain.Page<Worker> findAll(org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
    }

    private static class InMemoryFarmRecordRepository implements FarmRecordRepository {
        private final Map<String, FarmRecord> map = new HashMap<>();
        @Override public List<FarmRecord> findAllByFarmerId(String farmerId) {
            return map.values().stream().filter(f -> f.getFarmerId().equals(farmerId)).toList();
        }
        @Override public List<FarmRecord> findAllByFarmerIdAndRecordTypeOrderByRecordDateDesc(String farmerId, FarmRecord.RecordType type) {
            return map.values().stream().filter(f -> f.getFarmerId().equals(farmerId) && f.getRecordType() == type).toList();
        }
        @Override public Optional<FarmRecord> findByIdAndFarmerIdAndRecordType(String id, String farmerId, FarmRecord.RecordType type) {
            FarmRecord f = map.get(id);
            return f != null && f.getFarmerId().equals(farmerId) && f.getRecordType() == type ? Optional.of(f) : Optional.empty();
        }
        @Override public <S extends FarmRecord> S save(S entity) {
            if (entity.getId() == null) {
                try {
                    var f = FarmRecord.class.getDeclaredField("id");
                    f.setAccessible(true);
                    f.set(entity, UUID.randomUUID().toString());
                } catch (Exception ignored) {}
            }
            map.put(entity.getId(), entity);
            return entity;
        }
        @Override public <S extends FarmRecord> List<S> saveAll(Iterable<S> entities) { entities.forEach(this::save); return (List<S>) entities; }
        @Override public Optional<FarmRecord> findById(String s) { return Optional.ofNullable(map.get(s)); }
        @Override public boolean existsById(String s) { return map.containsKey(s); }
        @Override public List<FarmRecord> findAll() { return new ArrayList<>(map.values()); }
        @Override public List<FarmRecord> findAllById(Iterable<String> strings) { return Collections.emptyList(); }
        @Override public long count() { return map.size(); }
        @Override public void deleteById(String s) { map.remove(s); }
        @Override public void delete(FarmRecord entity) { map.remove(entity.getId()); }
        @Override public void deleteAllById(Iterable<? extends String> strings) {}
        @Override public void deleteAll(Iterable<? extends FarmRecord> entities) { entities.forEach(this::delete); }
        @Override public void deleteAll() { map.clear(); }
        @Override public void flush() {}
        @Override public <S extends FarmRecord> S saveAndFlush(S entity) { return save(entity); }
        @Override public <S extends FarmRecord> List<S> saveAllAndFlush(Iterable<S> entities) { return saveAll(entities); }
        @Override public void deleteAllInBatch(Iterable<FarmRecord> entities) {}
        @Override public void deleteAllByIdInBatch(Iterable<String> strings) {}
        @Override public void deleteAllInBatch() {}
        @Override public FarmRecord getOne(String s) { return map.get(s); }
        @Override public FarmRecord getById(String s) { return map.get(s); }
        @Override public FarmRecord getReferenceById(String s) { return map.get(s); }
        @Override public <S extends FarmRecord> Optional<S> findOne(org.springframework.data.domain.Example<S> example) { return Optional.empty(); }
        @Override public <S extends FarmRecord> List<S> findAll(org.springframework.data.domain.Example<S> example) { return Collections.emptyList(); }
        @Override public <S extends FarmRecord> List<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Sort sort) { return Collections.emptyList(); }
        @Override public <S extends FarmRecord> org.springframework.data.domain.Page<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public <S extends FarmRecord> long count(org.springframework.data.domain.Example<S> example) { return 0; }
        @Override public <S extends FarmRecord> boolean exists(org.springframework.data.domain.Example<S> example) { return false; }
        @Override public <S extends FarmRecord, R> R findBy(org.springframework.data.domain.Example<S> example, java.util.function.Function<org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public List<FarmRecord> findAll(org.springframework.data.domain.Sort sort) { return findAll(); }
        @Override public org.springframework.data.domain.Page<FarmRecord> findAll(org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
    }

    private static class DummyPasswordEncoder implements PasswordEncoder {
        @Override public String encode(CharSequence rawPassword) { return "hashed_" + rawPassword; }
        @Override public boolean matches(CharSequence rawPassword, String encodedPassword) {
            return encodedPassword.equals("hashed_" + rawPassword);
        }
    }
}
