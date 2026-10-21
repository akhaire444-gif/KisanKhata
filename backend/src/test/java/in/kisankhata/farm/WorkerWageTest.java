package in.kisankhata.farm;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class WorkerWageTest {

    @Test
    void testWageCalculationUponCreation() {
        Worker worker = new Worker(
            "farmer-1",
            "Ramesh Patil",
            12,
            new BigDecimal("450.00"),
            "9876543210",
            "ramesh@example.com",
            "Nashik Rural",
            "ramesh@upi"
        );

        // 12 * 450.00 = 5400.00
        assertEquals(new BigDecimal("5400.00"), worker.getPaymentAmount());
        assertEquals(12, worker.getDaysWorked());
        assertEquals("ramesh@upi", worker.getUpiId());
    }

    @Test
    void testZeroDaysWorked() {
        Worker worker = new Worker(
            "farmer-1",
            "Suresh Kumar",
            0,
            new BigDecimal("500.00"),
            "9876543211",
            null,
            null,
            null
        );

        assertEquals(new BigDecimal("0.00"), worker.getPaymentAmount());
    }

    @Test
    void testWageRecalculationUponUpdate() {
        Worker worker = new Worker(
            "farmer-1",
            "Ganesh",
            5,
            new BigDecimal("400.00"),
            "9876543212",
            null,
            null,
            null
        );
        assertEquals(new BigDecimal("2000.00"), worker.getPaymentAmount());

        // Update days worked to 15 at 420.50
        worker.update("Ganesh", 15, new BigDecimal("420.50"), "9876543212", null, null, "ganesh@okaxis");
        assertEquals(new BigDecimal("6307.50"), worker.getPaymentAmount());
        assertEquals("ganesh@okaxis", worker.getUpiId());
    }
}
