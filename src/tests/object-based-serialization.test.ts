import { beforeEach, describe, expect, it } from 'vitest';
import { S7e } from '../core/s7e';
import { JsonClass } from '../decorators/json-class';
import { JsonProperty } from '../decorators/json-property';

// Test classes for object-based serialization
@JsonClass({ name: 'PerformanceTestClass' })
class PerformanceTestClass {
  @JsonProperty({ name: 'id', type: String })
  public id!: string;

  @JsonProperty({ name: 'name' })
  public name!: string;

  @JsonProperty({ name: 'value' })
  public value!: number;

  @JsonProperty({ name: 'active' })
  public active!: boolean;

  @JsonProperty({ name: 'tags' })
  public tags!: string[];

  @JsonProperty({ name: 'metadata' })
  public metadata!: Record<string, unknown>;
}

@JsonClass({ name: 'NestedTestClass' })
class NestedTestClass {
  @JsonProperty({ name: 'id', type: String })
  public id!: string;

  @JsonProperty({ name: 'items' })
  public items!: PerformanceTestClass[];
}

describe('Object-Based Serialization Tests', () => {
  beforeEach(() => {
    S7e.registerTypes([PerformanceTestClass, NestedTestClass]);
  });

  describe('serializeToObject API', () => {
    it('should serialize to object without JSON.stringify/parse overhead', () => {
      const instance = new PerformanceTestClass();
      instance.id = 'test-123';
      instance.name = 'Test Object';
      instance.value = 42;
      instance.active = true;
      instance.tags = ['performance', 'test'];
      instance.metadata = { category: 'unit-test', priority: 'high' };

      // Test object-based serialization
      const obj = S7e.serializeToObject(instance);

      // Verify the result is a plain object
      expect(typeof obj).toBe('object');
      expect(obj).not.toBeNull();
      expect(obj).toEqual({
        $type: 'PerformanceTestClass',
        id: 'test-123',
        name: 'Test Object',
        value: 42,
        active: true,
        tags: ['performance', 'test'],
        metadata: { category: 'unit-test', priority: 'high' },
      });

      // Verify it's the same as the JSON-based approach
      const jsonSerialized = JSON.parse(S7e.serialize(instance));
      expect(obj).toEqual(jsonSerialized);
    });

    it('should handle null/undefined values', () => {
      const nullResult = S7e.serializeToObject(null);
      expect(nullResult).toBeNull();

      const undefinedResult = S7e.serializeToObject(undefined);
      expect(undefinedResult).toBeUndefined();
    });
  });

  describe('deserializeFromObject API', () => {
    it('should deserialize from object without JSON.parse/stringify overhead', () => {
      const obj = {
        $type: 'PerformanceTestClass',
        id: 'test-456',
        name: 'Deserialized Object',
        value: 100,
        active: false,
        tags: ['object', 'deserialization'],
        metadata: { source: 'object-api', efficient: true },
      };

      // Test object-based deserialization
      const result = S7e.deserializeFromObject(obj, PerformanceTestClass);

      // Verify the result
      expect(result).toBeInstanceOf(PerformanceTestClass);
      expect(result.id).toBe('test-456');
      expect(result.name).toBe('Deserialized Object');
      expect(result.value).toBe(100);
      expect(result.active).toBe(false);
      expect(result.tags).toEqual(['object', 'deserialization']);
      expect(result.metadata).toEqual({ source: 'object-api', efficient: true });

      // Verify it's the same as the JSON-based approach
      const jsonDeserialized = S7e.deserialize(JSON.stringify(obj), PerformanceTestClass);
      expect(result.id).toBe(jsonDeserialized.id);
      expect(result.name).toBe(jsonDeserialized.name);
      expect(result.value).toBe(jsonDeserialized.value);
      expect(result.active).toBe(jsonDeserialized.active);
      expect(result.tags).toEqual(jsonDeserialized.tags);
      expect(result.metadata).toEqual(jsonDeserialized.metadata);
    });

    it('should deserialize using class name from object', () => {
      const obj = {
        $type: 'PerformanceTestClass',
        id: 'test-789',
        name: 'Class Name Test',
        value: 200,
        active: true,
        tags: ['class-name'],
        metadata: { method: 'by-name' },
      };

      const result = S7e.deserializeFromObject(obj, 'PerformanceTestClass');

      expect(result).toBeInstanceOf(PerformanceTestClass);
      expect((result as PerformanceTestClass).id).toBe('test-789');
      expect((result as PerformanceTestClass).name).toBe('Class Name Test');
    });

    it('should deserialize using discriminator only from object', () => {
      const obj = {
        $type: 'PerformanceTestClass',
        id: 'test-discriminator',
        name: 'Discriminator Test',
        value: 300,
        active: false,
        tags: ['discriminator'],
        metadata: { auto: 'detection' },
      };

      const result = S7e.deserializeFromObject(obj);

      expect(result).toBeInstanceOf(PerformanceTestClass);
      expect((result as PerformanceTestClass).id).toBe('test-discriminator');
      expect((result as PerformanceTestClass).name).toBe('Discriminator Test');
    });

    it('should deserialize arrays from object', () => {
      const arrayObj = [
        {
          $type: 'PerformanceTestClass',
          id: 'array-1',
          name: 'Array Item 1',
          value: 10,
          active: true,
          tags: ['array'],
          metadata: { index: 0 },
        },
        {
          $type: 'PerformanceTestClass',
          id: 'array-2',
          name: 'Array Item 2',
          value: 20,
          active: false,
          tags: ['array'],
          metadata: { index: 1 },
        },
      ];

      const result = S7e.deserializeFromObject(arrayObj, [PerformanceTestClass]);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(PerformanceTestClass);
      expect(result[0].id).toBe('array-1');
      expect(result[1]).toBeInstanceOf(PerformanceTestClass);
      expect(result[1].id).toBe('array-2');
    });
  });

  describe('nested object performance', () => {
    it('should handle nested objects efficiently without JSON conversions', () => {
      const item1 = new PerformanceTestClass();
      item1.id = 'nested-1';
      item1.name = 'Nested Item 1';
      item1.value = 50;
      item1.active = true;
      item1.tags = ['nested'];
      item1.metadata = { level: 1 };

      const item2 = new PerformanceTestClass();
      item2.id = 'nested-2';
      item2.name = 'Nested Item 2';
      item2.value = 75;
      item2.active = false;
      item2.tags = ['nested'];
      item2.metadata = { level: 2 };

      const container = new NestedTestClass();
      container.id = 'container-1';
      container.items = [item1, item2];

      // Serialize to object
      const obj = S7e.serializeToObject(container);

      // Verify structure
      expect(obj).toEqual({
        $type: 'NestedTestClass',
        id: 'container-1',
        items: [
          {
            $type: 'PerformanceTestClass',
            id: 'nested-1',
            name: 'Nested Item 1',
            value: 50,
            active: true,
            tags: ['nested'],
            metadata: { level: 1 },
          },
          {
            $type: 'PerformanceTestClass',
            id: 'nested-2',
            name: 'Nested Item 2',
            value: 75,
            active: false,
            tags: ['nested'],
            metadata: { level: 2 },
          },
        ],
      });

      // Deserialize from object
      const result = S7e.deserializeFromObject(obj as Record<string, unknown>, NestedTestClass);

      expect(result).toBeInstanceOf(NestedTestClass);
      expect(result.id).toBe('container-1');
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toBeInstanceOf(PerformanceTestClass);
      expect(result.items[0].id).toBe('nested-1');
      expect(result.items[1]).toBeInstanceOf(PerformanceTestClass);
      expect(result.items[1].id).toBe('nested-2');
    });
  });

  describe('compatibility with existing JSON API', () => {
    it('should maintain compatibility with string-based serialize/deserialize', () => {
      const instance = new PerformanceTestClass();
      instance.id = 'compat-test';
      instance.name = 'Compatibility Test';
      instance.value = 999;
      instance.active = true;
      instance.tags = ['compatibility'];
      instance.metadata = { test: 'json-compatibility' };

      // Both approaches should produce the same results
      const jsonString = S7e.serialize(instance);
      const objResult = S7e.serializeToObject(instance);
      const jsonParsed = JSON.parse(jsonString);

      expect(objResult).toEqual(jsonParsed);

      // Both deserialize approaches should produce the same results
      const fromJson = S7e.deserialize(jsonString, PerformanceTestClass);
      const fromObj = S7e.deserializeFromObject(objResult as Record<string, unknown>, PerformanceTestClass);

      expect(fromJson.id).toBe(fromObj.id);
      expect(fromJson.name).toBe(fromObj.name);
      expect(fromJson.value).toBe(fromObj.value);
      expect(fromJson.active).toBe(fromObj.active);
      expect(fromJson.tags).toEqual(fromObj.tags);
      expect(fromJson.metadata).toEqual(fromObj.metadata);
    });
  });
});
