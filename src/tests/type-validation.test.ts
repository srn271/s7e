import { expect, test, describe } from 'vitest';
import { S7e } from '../core/s7e';
import { User } from './user.fixture';

describe('Type Validation', () => {
  test('should throw TypeError if type does not match decorator', () => {
    const json = '{"name":123,"age":30,"active":true}'; // name should be string, not number
    expect(() => S7e.deserialize(json, User)).toThrowError(
      /Type mismatch for property 'name'/
    );
  });
});
