import { beforeEach, expect } from 'vitest';
import { MetadataRegistry } from '../core/metadata-registry';
import { S7e } from '../core/s7e';

/**
 * Common test utilities and setup functions
 */
export class TestUtils {
  /**
   * Setup function to clear registries and reset state
   */
  public static setupCleanState() {
    beforeEach(() => {
      // Clear type registry
      S7e.clearTypeRegistry();
      MetadataRegistry.clearTypeRegistry();

      // Reset discriminator property to default
      S7e.setDiscriminatorProperty('$type');
    });
  }

  /**
   * Helper to create a test expectation for JSON serialization
   */
  public static expectJsonToBe(obj: any, expectedJson: string) {
    return expect(S7e.serialize(obj)).toBe(expectedJson);
  }

  /**
   * Helper to parse and validate JSON structure
   */
  public static expectJsonToHaveStructure(json: string, expectedStructure: Record<string, any>) {
    const parsed = JSON.parse(json);
    Object.entries(expectedStructure).forEach(([key, value]) => {
      expect(parsed).toHaveProperty(key, value);
    });
    return parsed;
  }

  /**
   * Helper to serialize and deserialize for testing roundtrip
   */
  public static serializeAndDeserialize(instance: any, ctor: any) {
    const json = S7e.serialize(instance);
    const deserialized = S7e.deserialize(json, ctor);
    expect(deserialized).toBeInstanceOf(ctor);
    return { json, deserialized };
  }

  /**
   * Helper to expect a property to be missing from JSON
   */
  public static expectJsonNotToHaveProperty(json: string, property: string) {
    const parsed = JSON.parse(json);
    expect(parsed).not.toHaveProperty(property);
  }

  /**
   * Helper to expect a property to exist in JSON with specific value
   */
  public static expectJsonToHaveProperty(json: string, property: string, value?: any) {
    const parsed = JSON.parse(json);
    if (value !== undefined) {
      expect(parsed).toHaveProperty(property, value);
    } else {
      expect(parsed).toHaveProperty(property);
    }
  }

  /**
   * Helper to test error throwing with specific message pattern
   */
  public static expectToThrowWithMessage(fn: () => void, messagePattern: RegExp | string) {
    expect(fn).toThrowError(messagePattern);
  }
}
