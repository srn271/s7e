import { expect, test, describe } from 'vitest';
import { S7e } from '../core/s7e';
import { Product } from './product.fixture';

describe('Different Property Names - Serialization and Deserialization', () => {
  describe('Serialization with different property names', () => {
    test('should serialize using JSON property names instead of class attribute names', () => {
      const product = new Product(
        'PROD-001',
        'Gaming Laptop',
        1299.99,
        true,
        ['electronics', 'computers', 'gaming'],
        'High-performance gaming laptop with RTX graphics',
      );

      const json = S7e.serialize(product);
      const parsed = JSON.parse(json);

      // Should use JSON property names, not class attribute names
      expect(parsed).toHaveProperty('product_id', 'PROD-001');
      expect(parsed).toHaveProperty('product_name', 'Gaming Laptop');
      expect(parsed).toHaveProperty('unit_price', 1299.99);
      expect(parsed).toHaveProperty('is_available', true);
      expect(parsed).toHaveProperty('category_tags', ['electronics', 'computers', 'gaming']);
      expect(parsed).toHaveProperty('description_text', 'High-performance gaming laptop with RTX graphics');

      // Should NOT have class attribute names
      expect(parsed).not.toHaveProperty('id');
      expect(parsed).not.toHaveProperty('title');
      expect(parsed).not.toHaveProperty('price');
      expect(parsed).not.toHaveProperty('inStock');
      expect(parsed).not.toHaveProperty('categories');
      expect(parsed).not.toHaveProperty('description');

      // Should not include non-serializable properties (none in this fixture)
    });

    test('should skip undefined optional properties in serialization', () => {
      const product = new Product(
        'PROD-002',
        'Wireless Mouse',
        29.99,
        true,
        ['electronics', 'accessories'],
        // description intentionally omitted (undefined)
      );

      const json = S7e.serialize(product);
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('product_id', 'PROD-002');
      expect(parsed).toHaveProperty('product_name', 'Wireless Mouse');
      expect(parsed).toHaveProperty('unit_price', 29.99);
      expect(parsed).toHaveProperty('is_available', true);
      expect(parsed).toHaveProperty('category_tags', ['electronics', 'accessories']);

      // Optional property should be omitted when undefined
      expect(parsed).not.toHaveProperty('description_text');
    });

    test('should include defined optional properties in serialization', () => {
      const product = new Product(
        'PROD-003',
        'Mechanical Keyboard',
        149.99,
        false,
        ['electronics', 'accessories'],
        'RGB mechanical keyboard with Cherry MX switches',
      );

      const json = S7e.serialize(product);
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('product_id', 'PROD-003');
      expect(parsed).toHaveProperty('product_name', 'Mechanical Keyboard');
      expect(parsed).toHaveProperty('unit_price', 149.99);
      expect(parsed).toHaveProperty('is_available', false);
      expect(parsed).toHaveProperty('category_tags', ['electronics', 'accessories']);
      expect(parsed).toHaveProperty('description_text', 'RGB mechanical keyboard with Cherry MX switches');
    });
  });

  describe('Deserialization with different property names', () => {
    test('should deserialize JSON with snake_case properties to camelCase class attributes', () => {
      const json = JSON.stringify({
        product_id: 'PROD-004',
        product_name: 'USB-C Hub',
        unit_price: 49.99,
        is_available: true,
        category_tags: ['electronics', 'accessories', 'connectivity'],
        description_text: 'Multi-port USB-C hub with 4K HDMI output',
      });

      const product = S7e.deserialize(json, Product);

      expect(product).toBeInstanceOf(Product);

      // Class attributes should have the correct values
      expect(product.id).toBe('PROD-004');
      expect(product.title).toBe('USB-C Hub');
      expect(product.price).toBe(49.99);
      expect(product.inStock).toBe(true);
      expect(product.categories).toEqual(['electronics', 'accessories', 'connectivity']);
      expect(product.description).toBe('Multi-port USB-C hub with 4K HDMI output');
    });

    test('should handle missing optional properties during deserialization', () => {
      const json = JSON.stringify({
        product_id: 'PROD-005',
        product_name: 'Bluetooth Speaker',
        unit_price: 79.99,
        is_available: false,
        category_tags: ['electronics', 'audio'],
        // description_text intentionally omitted
      });

      const product = S7e.deserialize(json, Product);

      expect(product).toBeInstanceOf(Product);
      expect(product.id).toBe('PROD-005');
      expect(product.title).toBe('Bluetooth Speaker');
      expect(product.price).toBe(79.99);
      expect(product.inStock).toBe(false);
      expect(product.categories).toEqual(['electronics', 'audio']);

      // Optional property should remain undefined
      expect(product.description).toBeUndefined();
    });

    test('should throw error when required property is missing', () => {
      const json = JSON.stringify({
        product_id: 'PROD-006',
        product_name: 'Smart Watch',
        unit_price: 299.99,
        // is_available is missing (required property)
        category_tags: ['electronics', 'wearables'],
      });

      expect(() => S7e.deserialize(json, Product)).toThrowError(
        /Missing required property 'is_available'/,
      );
    });

    test('should throw error when JSON uses class attribute names instead of JSON property names', () => {
      const json = JSON.stringify({
        id: 'PROD-007',           // Wrong: should be 'product_id'
        title: 'Smart Phone',     // Wrong: should be 'product_name'
        price: 699.99,            // Wrong: should be 'unit_price'
        inStock: true,            // Wrong: should be 'is_available'
        categories: ['electronics'], // Wrong: should be 'category_tags'
      });

      expect(() => S7e.deserialize(json, Product)).toThrowError(
        /Missing required property/,
      );
    });
  });

  describe('Round-trip serialization/deserialization', () => {
    test('should maintain data integrity through serialize -> deserialize cycle', () => {
      const original = new Product(
        'PROD-008',
        'Wireless Headphones',
        199.99,
        true,
        ['electronics', 'audio', 'wireless'],
        'Premium noise-cancelling wireless headphones',
      );

      // Serialize
      const json = S7e.serialize(original);

      // Deserialize
      const restored = S7e.deserialize(json, Product);

      // Verify all serializable properties are preserved
      expect(restored.id).toBe(original.id);
      expect(restored.title).toBe(original.title);
      expect(restored.price).toBe(original.price);
      expect(restored.inStock).toBe(original.inStock);
      expect(restored.categories).toEqual(original.categories);
      expect(restored.description).toBe(original.description);
    });

    test('should handle round-trip with undefined optional property', () => {
      const original = new Product(
        'PROD-009',
        'Power Bank',
        39.99,
        true,
        ['electronics', 'accessories'],
        // description intentionally undefined
      );

      const json = S7e.serialize(original);
      const restored = S7e.deserialize(json, Product);

      expect(restored.id).toBe(original.id);
      expect(restored.title).toBe(original.title);
      expect(restored.price).toBe(original.price);
      expect(restored.inStock).toBe(original.inStock);
      expect(restored.categories).toEqual(original.categories);
      expect(restored.description).toBeUndefined();
    });
  });

  describe('API compatibility scenarios', () => {
    test('should work with snake_case API responses', () => {
      // Simulate an API response with snake_case properties
      const apiResponse = {
        product_id: 'API-001',
        product_name: 'External SSD',
        unit_price: 129.99,
        is_available: true,
        category_tags: ['storage', 'electronics'],
        description_text: 'Fast external SSD with USB 3.2 Gen 2 interface',
      };

      const product = S7e.deserialize(JSON.stringify(apiResponse), Product);

      expect(product.id).toBe('API-001');
      expect(product.title).toBe('External SSD');
      expect(product.price).toBe(129.99);
      expect(product.inStock).toBe(true);
      expect(product.categories).toEqual(['storage', 'electronics']);
      expect(product.description).toBe('Fast external SSD with USB 3.2 Gen 2 interface');
    });

    test('should generate snake_case API-compatible JSON', () => {
      const product = new Product(
        'API-002',
        'Webcam HD',
        89.99,
        false,
        ['electronics', 'video'],
        '1080p HD webcam with auto-focus',
      );

      const json = S7e.serialize(product);
      const parsed = JSON.parse(json);

      // Should match expected API format
      expect(parsed).toEqual({
        product_id: 'API-002',
        product_name: 'Webcam HD',
        unit_price: 89.99,
        is_available: false,
        category_tags: ['electronics', 'video'],
        description_text: '1080p HD webcam with auto-focus',
      });
    });
  });
});
