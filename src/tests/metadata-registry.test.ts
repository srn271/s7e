import { expect, describe, test } from 'vitest';
import { MetadataRegistry } from '../core/metadata-registry';
import { JsonClass } from '../decorators/json-class';
import { JsonProperty } from '../decorators/json-property';

@JsonClass({ name: 'RegistryTestClass' })
class RegistryTestClass {
  @JsonProperty({ name: 'testProperty', type: String })
  public testProperty!: string;
}

describe('MetadataRegistry', () => {
  test('should centrally manage all metadata types', () => {
    // Ensure metadata is initialized by creating an instance
    const instance = new RegistryTestClass();
    instance.testProperty = 'test';

    // Test property metadata
    const properties = MetadataRegistry.getProperties(RegistryTestClass);
    expect(properties).toHaveLength(1);
    expect(properties[0].name).toBe('testProperty');
    expect(properties[0].jsonName).toBe('testProperty');

    const propertyOptions = MetadataRegistry.getPropertyOptions(RegistryTestClass, 'testProperty');
    expect(propertyOptions).toBeDefined();
    expect(propertyOptions?.type).toBe(String);

    // Test class metadata
    const classMetadata = MetadataRegistry.getClassMetadata(RegistryTestClass);
    expect(classMetadata).toBeDefined();
    expect(classMetadata?.name).toBe('RegistryTestClass');

    expect(MetadataRegistry.isJsonClass(RegistryTestClass)).toBe(true);
    expect(MetadataRegistry.getClassName(RegistryTestClass)).toBe('RegistryTestClass');

    // Test type registry
    MetadataRegistry.registerType('RegistryTestClass', RegistryTestClass);
    expect(MetadataRegistry.getRegisteredType('RegistryTestClass')).toBe(RegistryTestClass);

    // Test bulk registration
    MetadataRegistry.clearTypeRegistry();
    MetadataRegistry.registerTypes([RegistryTestClass]);
    expect(MetadataRegistry.getRegisteredType('RegistryTestClass')).toBe(RegistryTestClass);

    // Test clear functionality
    MetadataRegistry.clearTypeRegistry();
    expect(MetadataRegistry.getRegisteredType('RegistryTestClass')).toBeUndefined();
  });

  test('should handle metadata initialization', () => {
    // This should not throw and should work correctly
    expect(() => {
      MetadataRegistry.ensureMetadataInitialized(RegistryTestClass);
    }).not.toThrow();

    // Metadata should be available after initialization
    expect(MetadataRegistry.hasPropertyMetadata(RegistryTestClass)).toBe(true);
    expect(MetadataRegistry.hasClassMetadata(RegistryTestClass)).toBe(true);
  });
});
