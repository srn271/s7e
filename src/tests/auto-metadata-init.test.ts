import { expect, describe, test } from 'vitest';
import { MetadataRegistry } from '../core/metadata-registry';
import { JsonClass } from '../decorators/json-class';
import { JsonProperty } from '../decorators/json-property';

@JsonClass({ name: 'AutoInitTest' })
class AutoInitTest {
  @JsonProperty({ name: 'value', type: String })
  public value!: string;
}

describe('Automatic Metadata Initialization', () => {
  test('should automatically initialize metadata when calling getClassName', () => {
    // Clear any existing state
    MetadataRegistry.clearTypeRegistry();

    // This should work without manually creating an instance
    const className = MetadataRegistry.getClassName(AutoInitTest);
    expect(className).toBe('AutoInitTest');

    // And properties should also be available
    const properties = MetadataRegistry.getProperties(AutoInitTest);
    expect(properties).toHaveLength(1);
    expect(properties[0].name).toBe('value');
  });

  test('should automatically initialize metadata when calling isJsonClass', () => {
    // This should work without manually creating an instance
    const isDecorated = MetadataRegistry.isJsonClass(AutoInitTest);
    expect(isDecorated).toBe(true);
  });

  test('should automatically initialize metadata when calling getClassMetadata', () => {
    // This should work without manually creating an instance
    const metadata = MetadataRegistry.getClassMetadata(AutoInitTest);
    expect(metadata).toBeDefined();
    expect(metadata?.name).toBe('AutoInitTest');
  });

  test('should work seamlessly in registerTypes without explicit initialization', () => {
    MetadataRegistry.clearTypeRegistry();

    // This should work without any manual initialization
    MetadataRegistry.registerTypes([AutoInitTest]);

    const registeredType = MetadataRegistry.getRegisteredType('AutoInitTest');
    expect(registeredType).toBe(AutoInitTest);
  });
});
