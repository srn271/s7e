import { expect, test } from "vitest";
import { serialize, deserialize } from "./index";

class User {
  constructor(public name: string, public age: number) {}
}

test("serialize class instance", () => {
  const user = new User("Alice", 30);
  const json = serialize(user);
  expect(json).toBe('{"name":"Alice","age":30}');
});

test("deserialize class instance", () => {
  const json = '{"name":"Alice","age":30}';
  const restored = deserialize(User, json);
  expect(restored).toBeInstanceOf(User);
  expect(restored).toMatchObject({ name: "Alice", age: 30 });
});
