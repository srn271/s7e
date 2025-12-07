import { describe, expect, test } from 'vitest';
import { S7e } from '../core/s7e';
import { User } from './user.fixture';
import { Circle, Rectangle } from './discriminator.fixture';
import { TestUtils } from './test-utils';

describe('Array Serialization Support', () => {
  TestUtils.setupCleanState();

  test('should serialize array of objects', () => {
    const users = [
      new User('John', 25),
      new User('Jane', 30),
    ];

    const result = S7e.serialize(users);

    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'John',
        age: 25,
        active: true,
      });
      expect(result[1]).toEqual({
        name: 'Jane',
        age: 30,
        active: true,
      });
    }
  });

  test('should serialize empty array', () => {
    const emptyUsers: User[] = [];
    const result = S7e.serialize(emptyUsers);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  test('should maintain backward compatibility with single objects', () => {
    const user = new User('John', 25);

    const result = S7e.serialize(user);

    expect(Array.isArray(result)).toBe(false);
    expect(result).toEqual({
      name: 'John',
      age: 25,
      active: true,
    });
  });

  test('should serialize polymorphic array', () => {
    const shapes = [
      new Circle('c1', 5),
      new Rectangle('r1', 10, 20),
    ];

    const result = S7e.serialize(shapes);

    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        $type: 'Circle',
        id: 'c1',
        radius: 5,
      });
      expect(result[1]).toEqual({
        $type: 'Rectangle',
        id: 'r1',
        width: 10,
        height: 20,
      });
    }
  });

  test('should work with round-trip serialization', () => {
    const originalUsers = [
      new User('John', 25),
      new User('Jane', 30),
    ];

    // Serialize array
    const serialized = S7e.serialize(originalUsers);

    // Ensure we got an array
    expect(Array.isArray(serialized)).toBe(true);

    if (Array.isArray(serialized)) {
      // Deserialize array
      const deserialized = S7e.deserialize(serialized, [User]);

      expect(deserialized).toHaveLength(2);
      expect(deserialized[0]).toBeInstanceOf(User);
      expect(deserialized[1]).toBeInstanceOf(User);
      expect(deserialized[0].name).toBe('John');
      expect(deserialized[0].age).toBe(25);
      expect(deserialized[1].name).toBe('Jane');
      expect(deserialized[1].age).toBe(30);
    }
  });

});
