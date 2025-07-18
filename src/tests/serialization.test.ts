import { expect, test, describe } from 'vitest';
import { S7e } from '../core/s7e';
import { User } from './user.fixture';

describe('Serialization', () => {
  test('should serialize class instance to JSON', () => {
    const user = new User('Alice', 30, 'secret', 123);
    const json = S7e.serialize(user);
    expect(json).toBe('{"name":"Alice","age":30,"active":true}');
  });

  test('should skip undefined optional properties', () => {
    const user = new User('Bob', 0, '', 0, undefined, true);
    // nickname is undefined, active is true
    const json = S7e.serialize(user);
    expect(json).toBe('{"name":"Bob","age":0,"active":true}');
  });

  test('should include defined optional properties', () => {
    const user = new User('Bob', 42, '', 0, 'Bobby', false);
    const json = S7e.serialize(user);
    expect(json).toBe('{"name":"Bob","age":42,"nickname":"Bobby","active":false}');
  });
});
