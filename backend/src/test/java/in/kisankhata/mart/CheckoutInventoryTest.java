package in.kisankhata.mart;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class CheckoutInventoryTest {

    @Test
    void testStockDeductionSuccess() {
        Product product = new Product(
            "Organic Tomatoes",
            "Farm fresh organic tomatoes",
            "Vegetables",
            new BigDecimal("40.00"),
            100,
            "/api/v1/files/tomatoes.jpg"
        );

        assertEquals(100, product.getStockQuantity());
        product.deductStock(25);
        assertEquals(75, product.getStockQuantity());
    }

    @Test
    void testStockDeductionInsufficientThrows() {
        Product product = new Product(
            "Alphonso Mangoes",
            "GI tagged Ratnagiri Alphonso",
            "Fruits",
            new BigDecimal("600.00"),
            10,
            "/api/v1/files/mangoes.jpg"
        );

        assertThrows(IllegalStateException.class, () -> product.deductStock(15));
        assertEquals(10, product.getStockQuantity());
    }

    @Test
    void testStockRestorationOnOrderCancel() {
        Product product = new Product(
            "Wheat Grain",
            "Lokwan high grade wheat",
            "Grain",
            new BigDecimal("35.00"),
            50,
            null
        );

        product.deductStock(20);
        assertEquals(30, product.getStockQuantity());

        product.restoreStock(20);
        assertEquals(50, product.getStockQuantity());
    }
}
