import { expect, test } from 'vitest';
import { JsonProperty } from './json-property';
import { S7e } from './s7e';

class User {
  @JsonProperty()
  public name: string;

  @JsonProperty()
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
  const json = '{"name":"Alice","age":30}';
  const restored = S7e.deserialize(User, json);
  expect(restored).toBeInstanceOf(User);
  expect(restored).toMatchObject({ name: 'Alice', age: 30 });
  // Not serializable properties should have default values
  expect(restored.password).toBe('');
  expect(restored.internalId).toBe(0);
});
