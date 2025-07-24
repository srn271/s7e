import { describe, expect, test } from 'vitest';
import { S7e } from '../core/s7e';
import { JsonClass } from '../decorators/json-class';
import { JsonProperty } from '../decorators/json-property';

@JsonClass({ name: 'TestClass' })
class TestClass {
  @JsonProperty({ name: 'value', type: String })
  public value!: string;

  constructor(value?: string) {
    if (value) {
      this.value = value;
    }
  }
}

@JsonClass({ name: 'AbstractTestClass' })
abstract class AbstractTestClass {
  @JsonProperty({ name: 'id', type: String })
  public id!: string;
}

@JsonClass({ name: 'ConcreteTestClass' })
class ConcreteTestClass extends AbstractTestClass {
  @JsonProperty({ name: 'name', type: String })
  public name!: string;
}

describe('RegisterTypes Metadata Initialization', () => {
  test('should initialize metadata for classes with parameterless constructors', () => {
    // Clear any existing registrations
    S7e.clearTypeRegistry();

    // Register types - this should initialize metadata
    S7e.registerTypes([TestClass]);

    // Verify the class was registered
    const registeredType = S7e.getRegisteredType('TestClass');
    expect(registeredType).toBe(TestClass);

    // Verify we can deserialize using the registered type
    const json = '{"value":"test"}';
    const instance = S7e.deserialize(json, 'TestClass') as TestClass;
    expect(instance).toBeInstanceOf(TestClass);
    expect(instance.value).toBe('test');
  });

  test('should handle abstract classes gracefully during registration', () => {
    // Clear any existing registrations
    S7e.clearTypeRegistry();

    // Register types including abstract class - should not throw
    expect(() => {
      S7e.registerTypes([AbstractTestClass, ConcreteTestClass]);
    }).not.toThrow();

    // Verify both classes were registered
    expect(S7e.getRegisteredType('AbstractTestClass')).toBe(AbstractTestClass);
    expect(S7e.getRegisteredType('ConcreteTestClass')).toBe(ConcreteTestClass);
  });

  test('should allow polymorphic deserialization after registration', () => {
    // Clear and register types
    S7e.clearTypeRegistry();
    S7e.registerTypes([AbstractTestClass, ConcreteTestClass]);

    // Test polymorphic deserialization
    const json = '[{"$type":"ConcreteTestClass","id":"1","name":"test"}]';
    const instances = S7e.deserialize(json, [AbstractTestClass]);

    expect(instances).toHaveLength(1);
    expect(instances[0]).toBeInstanceOf(ConcreteTestClass);
    expect((instances[0] as ConcreteTestClass).id).toBe('1');
    expect((instances[0] as ConcreteTestClass).name).toBe('test');
  });
});
