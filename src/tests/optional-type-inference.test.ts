import { beforeEach, describe, expect, it } from 'vitest';
import { S7e } from '../core/s7e';
import { JsonClass } from '../decorators/json-class';
import { JsonProperty } from '../decorators/json-property';

// Test classes for optional type parameter
@JsonClass({ name: 'PersonWithInferredTypes' })
class PersonWithInferredTypes {
  // Type explicitly provided
  @JsonProperty({ name: 'firstName', type: String })
  public firstName!: string;

  // Type inferred automatically
  @JsonProperty({ name: 'age' })
  public age!: number;

  @JsonProperty({ name: 'isActive' })
  public isActive!: boolean;

  @JsonProperty({ name: 'tags' })
  public tags!: string[];

  @JsonProperty({ name: 'metadata' })
  public metadata!: Record<string, unknown>;
}

@JsonClass({ name: 'NestedClass' })
class NestedClass {
  @JsonProperty({ name: 'id', type: String })
  public id!: string;

  @JsonProperty({ name: 'value', type: Number })
  public value!: number;
}

@JsonClass({ name: 'ComplexClass' })
class ComplexClass {
  @JsonProperty({ name: 'name', type: String })
  public name!: string;

  // Array of objects without explicit type
  @JsonProperty({ name: 'items' })
  public items!: NestedClass[];

  // Plain object without explicit type
  @JsonProperty({ name: 'config' })
  public config!: Record<string, unknown>;
}

describe('Optional Type Parameter Tests', () => {
  beforeEach(() => {
    S7e.registerTypes([PersonWithInferredTypes, NestedClass, ComplexClass]);
  });

  describe('type inference for primitive types', () => {
    it('should infer string, number, and boolean types correctly', () => {
      const person = new PersonWithInferredTypes();
      person.firstName = 'John';
      person.age = 30;
      person.isActive = true;
      person.tags = ['developer', 'typescript'];
      person.metadata = { level: 'senior', department: 'engineering' };

      // Serialize
      const json = S7e.serialize(person);

      // Deserialize
      const result = S7e.deserialize(json, PersonWithInferredTypes);

      // Verify types and values
      expect(result).toBeInstanceOf(PersonWithInferredTypes);
      expect(result.firstName).toBe('John');
      expect(result.age).toBe(30);
      expect(result.isActive).toBe(true);
      expect(result.tags).toEqual(['developer', 'typescript']);
      expect(result.metadata).toEqual({ level: 'senior', department: 'engineering' });
    });

    it('should handle null and undefined values correctly', () => {
      const person = new PersonWithInferredTypes();
      person.firstName = 'Jane';
      person.age = 25;
      person.isActive = false;
      person.tags = [];
      person.metadata = {};

      const json = S7e.serialize(person);
      const result = S7e.deserialize(json, PersonWithInferredTypes);

      expect(result.firstName).toBe('Jane');
      expect(result.age).toBe(25);
      expect(result.isActive).toBe(false);
      expect(result.tags).toEqual([]);
      expect(result.metadata).toEqual({});
    });
  });

  describe('type inference for arrays', () => {
    it('should handle arrays of primitives without explicit type', () => {
      const person = new PersonWithInferredTypes();
      person.firstName = 'Alice';
      person.age = 28;
      person.isActive = true;
      person.tags = ['manager', 'product', 'leadership'];
      person.metadata = { team: ['dev', 'design', 'qa'] };

      const json = S7e.serialize(person);
      const result = S7e.deserialize(json, PersonWithInferredTypes);

      expect(result.tags).toEqual(['manager', 'product', 'leadership']);
      expect((result.metadata as any).team).toEqual(['dev', 'design', 'qa']);
    });

    it('should handle empty arrays correctly', () => {
      const person = new PersonWithInferredTypes();
      person.firstName = 'Bob';
      person.age = 35;
      person.isActive = false;
      person.tags = [];
      person.metadata = { emptyArray: [] };

      const json = S7e.serialize(person);
      const result = S7e.deserialize(json, PersonWithInferredTypes);

      expect(result.tags).toEqual([]);
      expect((result.metadata as any).emptyArray).toEqual([]);
    });
  });

  describe('type inference for complex objects', () => {
    it('should handle nested objects with discriminators', () => {
      const nested1 = new NestedClass();
      nested1.id = 'item1';
      nested1.value = 100;

      const nested2 = new NestedClass();
      nested2.id = 'item2';
      nested2.value = 200;

      const complex = new ComplexClass();
      complex.name = 'Test Complex';
      complex.items = [nested1, nested2];
      complex.config = {
        enabled: true,
        settings: { theme: 'dark', language: 'en' },
      };

      const json = S7e.serialize(complex);
      const result = S7e.deserialize(json, ComplexClass);

      expect(result).toBeInstanceOf(ComplexClass);
      expect(result.name).toBe('Test Complex');
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toBeInstanceOf(NestedClass);
      expect(result.items[0].id).toBe('item1');
      expect(result.items[0].value).toBe(100);
      expect(result.items[1]).toBeInstanceOf(NestedClass);
      expect(result.items[1].id).toBe('item2');
      expect(result.items[1].value).toBe(200);
      expect(result.config).toEqual({
        enabled: true,
        settings: { theme: 'dark', language: 'en' },
      });
    });

    it('should handle plain objects without discriminators', () => {
      const complex = new ComplexClass();
      complex.name = 'Plain Object Test';
      complex.items = [];
      complex.config = {
        database: { host: 'localhost', port: 5432 },
        cache: { ttl: 3600, enabled: true },
        features: ['auth', 'logging', 'metrics'],
      };

      const json = S7e.serialize(complex);
      const result = S7e.deserialize(json, ComplexClass);

      expect(result.config).toEqual({
        database: { host: 'localhost', port: 5432 },
        cache: { ttl: 3600, enabled: true },
        features: ['auth', 'logging', 'metrics'],
      });
    });
  });

  describe('mixed explicit and inferred types', () => {
    it('should work correctly when some properties have explicit types and others are inferred', () => {
      const person = new PersonWithInferredTypes();
      person.firstName = 'Mixed'; // explicit String type
      person.age = 42; // inferred number
      person.isActive = true; // inferred boolean
      person.tags = ['tag1', 'tag2']; // inferred string array
      person.metadata = { mixed: true, count: 5 }; // inferred object

      const json = S7e.serialize(person);
      const result = S7e.deserialize(json, PersonWithInferredTypes);

      expect(result.firstName).toBe('Mixed');
      expect(result.age).toBe(42);
      expect(result.isActive).toBe(true);
      expect(result.tags).toEqual(['tag1', 'tag2']);
      expect(result.metadata).toEqual({ mixed: true, count: 5 });
    });
  });

  describe('type inference edge cases', () => {
    it('should handle complex nested structures', () => {
      const person = new PersonWithInferredTypes();
      person.firstName = 'Complex';
      person.age = 30;
      person.isActive = true;
      person.tags = ['complex'];
      person.metadata = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
          mixed: [{ id: 1 }, { id: 2 }],
        },
        primitives: {
          str: 'string',
          num: 123,
          bool: false,
        },
      };

      const json = S7e.serialize(person);
      const result = S7e.deserialize(json, PersonWithInferredTypes);

      expect(result.metadata).toEqual({
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
          mixed: [{ id: 1 }, { id: 2 }],
        },
        primitives: {
          str: 'string',
          num: 123,
          bool: false,
        },
      });
    });

    it('should preserve type information through serialization/deserialization cycles', () => {
      const person = new PersonWithInferredTypes();
      person.firstName = 'Cycle Test';
      person.age = 25;
      person.isActive = false;
      person.tags = ['test'];
      person.metadata = { cycles: 1 };

      // First cycle
      let json = S7e.serialize(person);
      let result = S7e.deserialize(json, PersonWithInferredTypes);

      // Second cycle
      json = S7e.serialize(result);
      result = S7e.deserialize(json, PersonWithInferredTypes);

      // Third cycle
      json = S7e.serialize(result);
      result = S7e.deserialize(json, PersonWithInferredTypes);

      expect(result.firstName).toBe('Cycle Test');
      expect(result.age).toBe(25);
      expect(result.isActive).toBe(false);
      expect(result.tags).toEqual(['test']);
      expect(result.metadata).toEqual({ cycles: 1 });
    });
  });
});
