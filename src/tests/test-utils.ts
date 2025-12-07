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
   * Helper to create a test expectation for JSON serialization (backward compatibility)
   * Note: serialize() now returns objects, so this converts the expected JSON to object
   */
  public static expectJsonToBe(obj: object, expectedJson: string) {
    const expectedObj: object = JSON.parse(expectedJson);
    return expect(S7e.serialize(obj)).toEqual(expectedObj);
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
   * Helper to validate the structure of an object against expected properties
   */
  public static expectObjectToHaveStructure(obj: Record<string, unknown>, expectedStructure: Record<string, any>) {
    Object.entries(expectedStructure).forEach(([key, value]) => {
      expect(obj).toHaveProperty(key, value);
    });
    return obj;
  }

  /**
   * Helper to serialize and deserialize for testing roundtrip
   */
  public static serializeAndDeserialize(instance: any, ctor: any) {
    const obj: Record<string, unknown> | null | undefined = S7e.serialize(instance);
    if (obj === null || obj === undefined) {
      throw new Error('Cannot deserialize null or undefined object');
    }
    const deserialized = S7e.deserialize(obj, ctor);
    expect(deserialized).toBeInstanceOf(ctor);
    return { obj, deserialized };
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
