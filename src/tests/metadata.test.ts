import { describe, expect, test } from 'vitest';
import { MetadataRegistry } from '../core/metadata-registry';
import { JsonProperty } from '../decorators/json-property';

describe('Metadata Management', () => {
  test('should make metadata available immediately after class definition', () => {
    class TestClass {
      @JsonProperty({ name: 'name', type: String })
      public name: string;

      @JsonProperty({ name: 'age', type: Number, optional: true })
      public age?: number;

      constructor(name?: string, age?: number) {
        this.name = name ?? '';
        this.age = age;
      }
    }

    // Check that metadata is available immediately without creating an instance
    const properties = MetadataRegistry.getProperties(TestClass);
    expect(properties).toEqual([
      { name: 'name', jsonName: 'name' },
      { name: 'age', jsonName: 'age' },
    ]);

    const nameOptions = MetadataRegistry.getPropertyOptions(TestClass, 'name');
    expect(nameOptions).toEqual({ name: 'name', optional: false, type: String });

    const ageOptions = MetadataRegistry.getPropertyOptions(TestClass, 'age');
    expect(ageOptions).toEqual({ name: 'age', optional: true, type: Number });
  });

  test('should persist metadata across multiple instances', () => {
    class TestClass {
      @JsonProperty({ name: 'name', type: String })
      public name: string;

      constructor(name?: string) {
        this.name = name ?? '';
      }
    }

    // Create multiple instances
    const instance1 = new TestClass('test1');
    const instance2 = new TestClass('test2');

    // Metadata should still be available and consistent
    const properties = MetadataRegistry.getProperties(TestClass);
    expect(properties).toEqual([{ name: 'name', jsonName: 'name' }]);

    const nameOptions = MetadataRegistry.getPropertyOptions(TestClass, 'name');
    expect(nameOptions).toEqual({ name: 'name', optional: false, type: String });

    // Instances should work correctly
    expect(instance1.name).toBe('test1');
    expect(instance2.name).toBe('test2');
  });

  test('should work with classes that have required constructor parameters', () => {
    class RequiredParamsClass {
      @JsonProperty({ name: 'name', type: String })
      public name: string;

      @JsonProperty({ name: 'age', type: Number, optional: true })
      public age?: number;

      constructor(name: string, age?: number) {
        this.name = name;
        this.age = age;
      }
    }

    // Metadata should be available even before creating an instance
    const properties = MetadataRegistry.getProperties(RequiredParamsClass);
    expect(properties).toEqual([
      { name: 'name', jsonName: 'name' },
      { name: 'age', jsonName: 'age' },
    ]);

    const nameOptions = MetadataRegistry.getPropertyOptions(RequiredParamsClass, 'name');
    expect(nameOptions).toEqual({ name: 'name', optional: false, type: String });

    const ageOptions = MetadataRegistry.getPropertyOptions(RequiredParamsClass, 'age');
    expect(ageOptions).toEqual({ name: 'age', optional: true, type: Number });
  });
});
