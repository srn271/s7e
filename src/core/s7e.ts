import {
  getJsonProperties,
  getJsonPropertyOptions,
  JsonPropertyOptions,
} from '../decorators/json-property';
import { isNotNil } from '../utils/is-not-nil';
import { ObjectUtils } from '../utils/object-utils';

/**
 * Utility class for serializing and deserializing TypeScript class instances to and from JSON.
 */
export class S7e {
  /**
   * Serialize a class instance to a JSON string.
   * @param instance - The class instance to serialize.
   * @returns The JSON string representation of the instance.
   */
  public static serialize<T>(instance: T): string {
    if (!instance) return JSON.stringify(instance);
    const ctor = instance.constructor;
    const props = getJsonProperties(ctor);
    const obj: Record<string, unknown> = {};
    for (const key of props) {
      const options: JsonPropertyOptions | undefined = getJsonPropertyOptions(ctor, key);
      const value = (instance as any)[key];
      if (options?.optional && typeof value === 'undefined') {
        continue; // skip undefined optional properties
      }
      obj[key] = value;
    }
    return JSON.stringify(obj);
  }

  /**
   * Deserialize a JSON string to a class instance.
   * @param json - The JSON string to deserialize.
   * @param cls - The class constructor to instantiate.
   * @returns An instance of the class with properties from the JSON.
   */
  public static deserialize<T extends object>(
    json: string,
    cls: new (...args: any[]) => T
  ): T {
    const obj: Record<string, unknown> = JSON.parse(json);
    const properties: string[] = getJsonProperties(cls);
    const instance: T = new cls();
    for (const key of properties) {
      const options: JsonPropertyOptions | undefined = getJsonPropertyOptions(cls, key);
      if (!ObjectUtils.hasOwnProperty(obj, key)) {
        // If property is optional and not present in JSON, skip assignment (use default)
        if (options?.optional === true) {
          continue;
        }
        // If not optional, throw error
        throw new Error(`Missing required property '${key}' in JSON during deserialization.`);
      }
      // If property is present in JSON, always deserialize, even if optional
      const typeFn = options?.type ?? String;
      const jsonValue: unknown = obj[key];
      S7e.validateType(options, jsonValue, key);
      const value: unknown = isNotNil(jsonValue) ? typeFn(jsonValue) : jsonValue;
      (instance as any)[key] = value;
    }
    return instance;
  }

  private static validateType(
    options: JsonPropertyOptions | undefined,
    jsonValue: unknown,
    key: string
  ): void {
    if (isNotNil(options?.type) && isNotNil(jsonValue)) {
      const expectedType = options.type;
      const actualType = isNotNil(jsonValue.constructor)
        ? jsonValue.constructor
        : undefined;
      if (isNotNil(actualType) && actualType !== expectedType) {
        throw new TypeError(
          `Type mismatch for property '${key}': expected ${expectedType.name}, got ${actualType.name}`
        );
      }
    }
  }

}
