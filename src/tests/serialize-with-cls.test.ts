import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { S7e } from '../core/s7e';
import { Car, Circle, Rectangle, Shape, Vehicle } from './discriminator.fixture';

describe('Serialize with `cls` parameter', () => {

  beforeEach(() => {
    S7e.clearTypeRegistry();
    S7e.registerTypes([Shape, Circle, Rectangle, Vehicle, Car]);
  });

  afterEach(() => {
    S7e.clearTypeRegistry();
  });

  test('should serialize with explicit class parameter taking precedence', () => {
    const circle = new Circle('circle-1', 5.0);

    // Serialize with explicit Shape class - should use Shape discriminator
    const resultWithCls = S7e.serialize(circle, Shape);

    // Should have Shape discriminator instead of Circle and only Shape properties
    expect(resultWithCls).toEqual({
      $type: 'Shape',
      id: 'circle-1',
      // radius should not be present
    });

    // Compare with normal serialization
    const resultNormal = S7e.serialize(circle);
    expect(resultNormal).toEqual({
      $type: 'Circle',
      id: 'circle-1',
      radius: 5.0,
    });
  });

  test('should serialize to object with explicit class parameter', () => {
    const car = new Car('Toyota', 4);

    // Serialize to object with explicit Vehicle class
    const resultWithCls = S7e.serialize(car, Vehicle);

    expect(resultWithCls).toEqual({
      $type: 'Vehicle',
      brand: 'Toyota',
      // 'doors' should not be present
    });

    // Compare with normal serialization
    const resultNormal = S7e.serialize(car);

    expect(resultNormal).toEqual({
      $type: 'Car',
      brand: 'Toyota',
      doors: 4,
    });
  });

  test('should maintain backward compatibility when cls parameter is not provided', () => {
    const rectangle = new Rectangle('rect-1', 10, 20);

    // Test that both serialize methods produce consistent results
    const serializedResult = S7e.serialize(rectangle);

    expect(serializedResult).toEqual({
      $type: 'Rectangle',
      id: 'rect-1',
      width: 10,
      height: 20,
    });
  });

});
