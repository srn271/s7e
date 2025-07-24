import { describe, test } from 'vitest';
import { TestUtils } from './test-utils';
import { User } from './user.fixture';

describe('Serialization', () => {
  test('should serialize class instance to JSON', () => {
    const user = new User('Alice', 30, 'secret', 123);
    TestUtils.expectJsonToBe(user, '{"name":"Alice","age":30,"active":true}');
  });

  test('should skip undefined optional properties', () => {
    const user = new User('Bob', 0, '', 0, undefined, true);
    // nickname is undefined, active is true
    TestUtils.expectJsonToBe(user, '{"name":"Bob","age":0,"active":true}');
  });

  test('should include defined optional properties', () => {
    const user = new User('Bob', 42, '', 0, 'Bobby', false);
    TestUtils.expectJsonToBe(user, '{"name":"Bob","age":42,"nickname":"Bobby","active":false}');
  });
});
