import { beforeEach, describe, expect, test } from 'vitest';
import { S7e } from '../core/s7e';
import { JsonClass } from '../decorators/json-class';
import { JsonProperty } from '../decorators/json-property';

// Test classes for discriminator-based deserialization
@JsonClass({ name: 'BaseVehicle' })
class Vehicle {
  @JsonProperty({ name: 'brand', type: String })
  public brand!: string;

  @JsonProperty({ name: 'model', type: String })
  public model!: string;
}

@JsonClass({ name: 'SportsCar' })
class Car extends Vehicle {
  @JsonProperty({ name: 'doors', type: Number })
  public doors!: number;

  @JsonProperty({ name: 'horsepower', type: Number })
  public horsepower!: number;
}

@JsonClass({ name: 'Motorcycle' })
class Bike extends Vehicle {
  @JsonProperty({ name: 'engineSize', type: Number })
  public engineSize!: number;

  @JsonProperty({ name: 'hasWindshield', type: Boolean })
  public hasWindshield!: boolean;
}

@JsonClass({ name: 'SimpleClass' })
class SimpleClass {
  @JsonProperty({ name: 'name', type: String })
  public name!: string;

  @JsonProperty({ name: 'value', type: Number })
  public value!: number;
}

describe('Optional Type Parameter Tests', () => {
  beforeEach(() => {
    // Register types for discriminator resolution
    S7e.registerTypes([Vehicle, Car, Bike, SimpleClass]);
  });

  describe('deserialize with no type parameter', () => {
    test('should deserialize using discriminator when no type is provided', () => {
      // Test data
      const carJson = JSON.stringify({
        $type: 'SportsCar',
        brand: 'Ferrari',
        model: 'F40',
        doors: 2,
        horsepower: 478,
      });

      // Deserialize without providing type
      const result = S7e.deserialize(carJson);

      // Verify the result
      expect(result).toBeInstanceOf(Car);
      const car = result as Car;
      expect(car.brand).toBe('Ferrari');
      expect(car.model).toBe('F40');
      expect(car.doors).toBe(2);
      expect(car.horsepower).toBe(478);
    });

    test('should deserialize different types based on discriminator', () => {
      // Test data for motorcycle
      const bikeJson = JSON.stringify({
        $type: 'Motorcycle',
        brand: 'Harley-Davidson',
        model: 'Sportster',
        engineSize: 883,
        hasWindshield: false,
      });

      // Deserialize without providing type
      const result = S7e.deserialize(bikeJson);

      // Verify the result
      expect(result).toBeInstanceOf(Bike);
      const bike = result as Bike;
      expect(bike.brand).toBe('Harley-Davidson');
      expect(bike.model).toBe('Sportster');
      expect(bike.engineSize).toBe(883);
      expect(bike.hasWindshield).toBe(false);
    });

    test('should deserialize simple class using discriminator', () => {
      // Test data for simple class
      const simpleJson = JSON.stringify({
        $type: 'SimpleClass',
        name: 'Test Item',
        value: 42,
      });

      // Deserialize without providing type
      const result = S7e.deserialize(simpleJson);

      // Verify the result
      expect(result).toBeInstanceOf(SimpleClass);
      const simple = result as SimpleClass;
      expect(simple.name).toBe('Test Item');
      expect(simple.value).toBe(42);
    });

    test('should throw error when discriminator property is missing', () => {
      // Test data without discriminator
      const jsonWithoutDiscriminator = JSON.stringify({
        brand: 'Toyota',
        model: 'Camry',
      });

      // Should throw error
      expect(() => S7e.deserialize(jsonWithoutDiscriminator)).toThrow(
        'No discriminator property \'$type\' found in object or value is not a string',
      );
    });

    test('should throw error when discriminator value is not registered', () => {
      // Test data with unregistered discriminator
      const jsonWithUnknownType = JSON.stringify({
        $type: 'UnregisteredType',
        brand: 'Unknown',
        model: 'Unknown',
      });

      // Should throw error
      expect(() => S7e.deserialize(jsonWithUnknownType)).toThrow(
        'No registered class found for discriminator value: UnregisteredType',
      );
    });

    test('should throw error when JSON is not a valid object', () => {
      // Test with invalid JSON structure
      const invalidJson = JSON.stringify('not an object');

      // Should throw error
      expect(() => S7e.deserialize(invalidJson)).toThrow(
        'Object must be a valid object to deserialize by discriminator',
      );
    });

    test('should throw error when discriminator value is not a string', () => {
      // Test data with non-string discriminator
      const jsonWithNonStringDiscriminator = JSON.stringify({
        $type: 123,
        name: 'Test',
      });

      // Should throw error
      expect(() => S7e.deserialize(jsonWithNonStringDiscriminator)).toThrow(
        'No discriminator property \'$type\' found in object or value is not a string',
      );
    });
  });

  describe('traditional deserialization still works', () => {
    test('should work with explicit type parameter', () => {
      // Test that providing explicit type still works
      const carJson = JSON.stringify({
        $type: 'SportsCar',
        brand: 'Lamborghini',
        model: 'Huracán',
        doors: 2,
        horsepower: 630,
      });

      // Deserialize with explicit type
      const result = S7e.deserialize(carJson, Car);

      // Verify the result
      expect(result).toBeInstanceOf(Car);
      expect(result.brand).toBe('Lamborghini');
      expect(result.model).toBe('Huracán');
      expect(result.doors).toBe(2);
      expect(result.horsepower).toBe(630);
    });

    test('should work with string class name', () => {
      // Test that providing string class name still works
      const bikeJson = JSON.stringify({
        $type: 'Motorcycle',
        brand: 'BMW',
        model: 'R1250GS',
        engineSize: 1254,
        hasWindshield: true,
      });

      // Deserialize with string class name
      const result = S7e.deserialize(bikeJson, 'Motorcycle');

      // Verify the result
      expect(result).toBeInstanceOf(Bike);
      const bike = result as Bike;
      expect(bike.brand).toBe('BMW');
      expect(bike.model).toBe('R1250GS');
      expect(bike.engineSize).toBe(1254);
      expect(bike.hasWindshield).toBe(true);
    });

    test('should work with array type for polymorphic arrays', () => {
      // Test array deserialization still works
      const vehiclesJson = JSON.stringify([
        {
          $type: 'SportsCar',
          brand: 'Porsche',
          model: '911',
          doors: 2,
          horsepower: 379,
        },
        {
          $type: 'Motorcycle',
          brand: 'Ducati',
          model: 'Panigale',
          engineSize: 1103,
          hasWindshield: false,
        },
      ]);

      // Deserialize array
      const results = S7e.deserialize(vehiclesJson, [Vehicle]);

      // Verify the results
      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(2);

      const [car, bike] = results as [Car, Bike];
      expect(car).toBeInstanceOf(Car);
      expect(car.brand).toBe('Porsche');
      expect(bike).toBeInstanceOf(Bike);
      expect(bike.brand).toBe('Ducati');
    });
  });
});
