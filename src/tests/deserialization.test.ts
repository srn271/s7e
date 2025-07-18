import { expect, test, describe } from 'vitest';
import { S7e } from '../core/s7e';
import { User } from './user.fixture';

describe('Deserialization', () => {
  test('should deserialize JSON to class instance', () => {
    const json = '{"name":"Alice","age":30,"active":true}';
    const deserialized: User = S7e.deserialize(json, User);
    expect(deserialized).toBeInstanceOf(User);
    expect(deserialized.name).toBe('Alice');
    expect(deserialized.age).toBe(30);
    expect(deserialized.active).toBe(true);
    expect(deserialized.password).toBe('');
    expect(deserialized.internalId).toBe(0);
  });

  test('should use default for missing optional property', () => {
    const json = '{"name":"Bob","age":42,"active":true}';
    const user: User = S7e.deserialize(json, User);
    expect(user.name).toBe('Bob');
    expect(user.age).toBe(42);
    expect(user.nickname).toBeUndefined(); // default for optional
    expect(user.active).toBe(true);
  });

  test('should assign value if optional property is present', () => {
    const json = '{"name":"Bob","age":42,"nickname":"Bobby","active":false}';
    const user: User = S7e.deserialize(json, User);
    expect(user.name).toBe('Bob');
    expect(user.age).toBe(42);
    expect(user.nickname).toBe('Bobby');
    expect(user.active).toBe(false);
  });

  test('should throw error if required property is missing', () => {
    const json = '{"name":"Bob","age":42}';
    // active is required (optional: false)
    expect(() => S7e.deserialize(json, User)).toThrowError(
      /Missing required property 'active'/
    );
  });

  test('should set default values for non-serializable properties', () => {
    const json = '{"name":"Alice","age":30,"active":true}';
    const deserialized: User = S7e.deserialize(json, User);
    expect(deserialized.password).toBe('');
    expect(deserialized.internalId).toBe(0);
  });
});
