import { expect, test } from 'vitest';
import { S7e } from './core/s7e';
import { JsonProperty } from './decorators/json-property';

class User {
  @JsonProperty({ type: String })
  public name: string;

  @JsonProperty({ type: Number })
  public age: number;

  // Not serializable properties
  public password: string;
  public internalId: number;

  constructor();
  constructor(
    name: string,
    age: number,
    password?: string,
    internalId?: number
  );
  constructor(
    name?: string,
    age?: number,
    password?: string,
    internalId?: number
  ) {
    this.name = name ?? '';
    this.age = age ?? 0;
    this.password = password ?? '';
    this.internalId = internalId ?? 0;
  }
}

test('serialize class instance', () => {
  const user = new User('Alice', 30, 'secret', 123);
  const json = S7e.serialize(user);
  expect(json).toBe('{"name":"Alice","age":30}');
});

test('deserialize class instance', () => {
  // purposely use string and string-number to test type conversion
  const json = '{"name":"Alice","age":"30"}';
  const restored = S7e.deserialize(User, json);
  expect(restored).toBeInstanceOf(User);
  expect(restored.name).toBe('Alice'); // String conversion
  expect(restored.age).toBe(30); // Number conversion
  // Not serializable properties should have default values
  expect(restored.password).toBe('');
  expect(restored.internalId).toBe(0);
});
