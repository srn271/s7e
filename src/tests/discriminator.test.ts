import { beforeEach, describe, expect, test } from 'vitest';
import { S7e } from '../core/s7e';
import { Car, Circle, Motorcycle, Rectangle, Shape, Vehicle } from './discriminator.fixture';
import { TestUtils } from './test-utils';

describe('Discriminator Support', () => {
  TestUtils.setupCleanState();

  describe('Discriminator property configuration', () => {
    test('should have default discriminator property as $type', () => {
      expect(S7e.getDiscriminatorProperty()).toBe('$type');
    });

    test('should allow setting custom discriminator property', () => {
      S7e.setDiscriminatorProperty('type');
      expect(S7e.getDiscriminatorProperty()).toBe('type');
    });
  });

  describe('Type registry', () => {
    test('should register types correctly', () => {
      S7e.registerTypes([Circle, Rectangle]);

      expect(S7e.getRegisteredType('Circle')).toBe(Circle);
      expect(S7e.getRegisteredType('Rectangle')).toBe(Rectangle);
      expect(S7e.getRegisteredType('NonExistent')).toBeUndefined();
    });

    test('should clear type registry', () => {
      S7e.registerTypes([Circle, Rectangle]);
      expect(S7e.getRegisteredType('Circle')).toBe(Circle);

      S7e.clearTypeRegistry();
      expect(S7e.getRegisteredType('Circle')).toBeUndefined();
    });
  });

  describe('Serialization with discriminator', () => {
    test('should add discriminator property during serialization', () => {
      const circle = new Circle('c1', 5);
      const obj = S7e.serialize(circle) as Record<string, unknown>;

      expect(obj.$type).toBe('Circle');
      expect(obj.id).toBe('c1');
      expect(obj.radius).toBe(5);
    });

    test('should use custom discriminator property name', () => {
      S7e.setDiscriminatorProperty('objectType');

      const rectangle = new Rectangle('r1', 10, 20);
      const obj = S7e.serialize(rectangle) as Record<string, unknown>;

      expect(obj.objectType).toBe('Rectangle');
      expect(obj.id).toBe('r1');
      expect(obj.width).toBe(10);
      expect(obj.height).toBe(20);
    });
  });

  describe('Deserialization by class name', () => {
    beforeEach(() => {
      S7e.registerTypes([Circle, Rectangle, Car, Motorcycle]);
    });

    test('should deserialize using class name', () => {
      const json = '{"$type":"Circle","id":"c1","radius":5}';
      const circle = S7e.deserialize(json, 'Circle') as Circle;

      expect(circle).toBeInstanceOf(Circle);
      expect(circle.id).toBe('c1');
      expect(circle.radius).toBe(5);
    });

    test('should throw error for unregistered class name', () => {
      const json = '{"$type":"Triangle","id":"t1"}';

      expect(() => {
        S7e.deserialize(json, 'Triangle');
      }).toThrow('Class \'Triangle\' is not registered. Use S7e.registerTypes() to register it.');
    });
  });

  describe('Polymorphic array deserialization', () => {
    beforeEach(() => {
      S7e.registerTypes([Circle, Rectangle, Car, Motorcycle]);
    });

    test('should deserialize array with mixed types correctly', () => {
      const json = JSON.stringify([
        { $type: 'Circle', id: 'c1', radius: 5 },
        { $type: 'Rectangle', id: 'r1', width: 10, height: 20 },
        { $type: 'Circle', id: 'c2', radius: 3 },
      ]);

      const shapes = S7e.deserialize(json, [Shape]);

      expect(shapes).toHaveLength(3);
      expect(shapes[0]).toBeInstanceOf(Circle);
      expect(shapes[1]).toBeInstanceOf(Rectangle);
      expect(shapes[2]).toBeInstanceOf(Circle);

      const circle1 = shapes[0] as Circle;
      const rectangle = shapes[1] as Rectangle;
      const circle2 = shapes[2] as Circle;

      expect(circle1.id).toBe('c1');
      expect(circle1.radius).toBe(5);
      expect(rectangle.id).toBe('r1');
      expect(rectangle.width).toBe(10);
      expect(rectangle.height).toBe(20);
      expect(circle2.id).toBe('c2');
      expect(circle2.radius).toBe(3);
    });

    test('should handle missing discriminator by using base class', () => {
      const json = JSON.stringify([
        { $type: 'Circle', id: 'c1', radius: 5 },
        { id: 'unknown', someProperty: 'value' }, // No discriminator
      ]);

      const shapes = S7e.deserialize(json, [Shape]);

      expect(shapes).toHaveLength(2);
      expect(shapes[0]).toBeInstanceOf(Circle);
      expect(shapes[1]).toBeInstanceOf(Shape);

      expect((shapes[0] as Circle).radius).toBe(5);
      expect(shapes[1].id).toBe('unknown');
    });

    test('should work with different inheritance hierarchies', () => {
      const json = JSON.stringify([
        { $type: 'Car', brand: 'Toyota', doors: 4 },
        { $type: 'Motorcycle', brand: 'Honda', engineSize: 600 },
      ]);

      const vehicles = S7e.deserialize(json, [Vehicle]);

      expect(vehicles).toHaveLength(2);
      expect(vehicles[0]).toBeInstanceOf(Car);
      expect(vehicles[1]).toBeInstanceOf(Motorcycle);

      const car = vehicles[0] as Car;
      const motorcycle = vehicles[1] as Motorcycle;

      expect(car.brand).toBe('Toyota');
      expect(car.doors).toBe(4);
      expect(motorcycle.brand).toBe('Honda');
      expect(motorcycle.engineSize).toBe(600);
    });
  });

  describe('Single object deserialization with discriminator', () => {
    beforeEach(() => {
      S7e.registerTypes([Circle, Rectangle]);
    });

    test('should use discriminator to resolve correct type', () => {
      const json = '{"$type":"Circle","id":"c1","radius":5}';
      const shape = S7e.deserialize(json, Shape);

      expect(shape).toBeInstanceOf(Circle);
      expect((shape as Circle).radius).toBe(5);
    });

    test('should fallback to provided constructor when discriminator not found', () => {
      const json = '{"$type":"UnknownType","id":"c1","radius":5}';
      const shape = S7e.deserialize(json, Circle);

      expect(shape).toBeInstanceOf(Circle);
      expect(shape.id).toBe('c1');
      expect(shape.radius).toBe(5);
    });
  });
});
