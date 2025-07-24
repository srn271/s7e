import { describe, expect, test } from 'vitest';
import { S7e } from '../core/s7e';
import { TestUtils } from './test-utils';
import { User } from './user.fixture';

describe('Type Validation', () => {
  test('should throw TypeError if type does not match decorator', () => {
    const json = '{"name":123,"age":30,"active":true}'; // name should be string, not number
    TestUtils.expectToThrowWithMessage(
      () => S7e.deserialize(json, User),
      /Type mismatch for property 'name'/,
    );
  });

  test('should throw TypeError for number field with string value', () => {
    const json = '{"name":"Alice","age":"thirty","active":true}'; // age should be number, not string
    TestUtils.expectToThrowWithMessage(
      () => S7e.deserialize(json, User),
      /Type mismatch for property 'age': expected Number, got String/,
    );
  });

  test('should throw TypeError for boolean field with string value', () => {
    const json = '{"name":"Alice","age":30,"active":"yes"}'; // active should be boolean, not string
    TestUtils.expectToThrowWithMessage(
      () => S7e.deserialize(json, User),
      /Type mismatch for property 'active': expected Boolean, got String/,
    );
  });

  test('should throw TypeError for boolean field with number value', () => {
    const json = '{"name":"Alice","age":30,"active":1}'; // active should be boolean, not number
    TestUtils.expectToThrowWithMessage(
      () => S7e.deserialize(json, User),
      /Type mismatch for property 'active': expected Boolean, got Number/,
    );
  });

  test('should not throw error for correct types', () => {
    const json = '{"name":"Alice","age":30,"active":true}';
    expect(() => S7e.deserialize(json, User)).not.toThrow();
  });

  test('should not throw error for null values', () => {
    const json = '{"name":null,"age":30,"active":true}';
    expect(() => S7e.deserialize(json, User)).not.toThrow();
  });
});
