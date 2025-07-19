import {
  ClassConstructor,
  getJsonProperties,
  getJsonPropertyOptions,
  JsonPropertyOptions,
  TypeConstructor,
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
    const ctor = instance.constructor as ClassConstructor;
    const props = getJsonProperties(ctor);
    const obj: Record<string, unknown> = {};
    for (const key of props) {
      const options: JsonPropertyOptions | undefined = getJsonPropertyOptions(ctor, key);
      const value = (instance as any)[key];
      if (options?.optional && typeof value === 'undefined') {
        continue; // skip undefined optional properties
      }

      obj[key] = S7e.serializeValue(options, value);
    }
    return JSON.stringify(obj);
  }

  private static serializeValue(
    options: JsonPropertyOptions | undefined,
    value: unknown
  ): unknown {
    // Handle array serialization
    if (Array.isArray(options?.type) && Array.isArray(value)) {
      return value.map((item: unknown): unknown => {
        // If the array item is an object with a serialize method (another class), serialize it
        if (isNotNil(item) && typeof item === 'object' && typeof item.constructor === 'function'
          && getJsonProperties(item.constructor as ClassConstructor).length > 0
        ) {
          return JSON.parse(S7e.serialize(item));
        }
        return item;
      });
    }

    // Regular single value serialization
    return value;
  }

  /**
   * Deserialize a JSON string to a class instance.
   * @param json - The JSON string to deserialize.
   * @param cls - The class constructor to instantiate.
   * @returns An instance of the class with properties from the JSON.
   */
  public static deserialize<T extends object>(
    json: string,
    cls: ClassConstructor<T>
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
      const jsonValue: unknown = obj[key];
      S7e.validateType(options, jsonValue, key);

      const value = S7e.deserializeValue(options, jsonValue);
      (instance as any)[key] = value;
    }
    return instance;
  }

  private static deserializeValue(
    options: JsonPropertyOptions | undefined,
    jsonValue: unknown
  ): unknown {
    // Handle array deserialization
    if (Array.isArray(options?.type) && Array.isArray(jsonValue)) {
      const elementType = options.type[0];
      return jsonValue.map(item => {
        if (isNotNil(item) && elementType) {
          // If elementType is a class constructor with JsonProperty decorators, deserialize as object
          if (S7e.isClassConstructor(elementType) &&
            getJsonProperties(elementType).length > 0) {
            return S7e.deserialize(JSON.stringify(item), elementType);
          }
          // Otherwise use the type constructor for primitive types
          return S7e.convertValue(elementType, item);
        }
        return item;
      });
    }

    // Regular single value deserialization
    const typeFn = Array.isArray(options?.type) ? String : (options?.type ?? String);
    return isNotNil(jsonValue) ? S7e.convertValue(typeFn, jsonValue) : jsonValue;
  }

  private static convertValue(typeConstructor: TypeConstructor, value: unknown): unknown {
    // Handle primitive type conversions
    if (typeConstructor === String) {
      return String(value);
    } else if (typeConstructor === Number) {
      return Number(value);
    } else if (typeConstructor === Boolean) {
      return Boolean(value);
    }
    // For class constructors, we should not convert here as they need proper deserialization
    return value;
  }

  private static isClassConstructor(type: TypeConstructor): type is ClassConstructor {
    return type !== String && type !== Number && type !== Boolean;
  }

  private static validateType(
    options: JsonPropertyOptions | undefined,
    jsonValue: unknown,
    key: string
  ): void {
    if (!isNotNil(jsonValue)) {
      return;
    }

    // Handle array validation
    if (Array.isArray(options?.type)) {
      S7e.validateArrayType(jsonValue, key);
      return;
    }

    // Handle single value validation
    S7e.validateSingleType(options, jsonValue, key);
  }

  private static validateArrayType(jsonValue: unknown, key: string): void {
    if (!Array.isArray(jsonValue)) {
      throw new TypeError(
        `Type mismatch for property '${key}': expected Array, got ${typeof jsonValue}`
      );
    }
  }

  private static validateSingleType(
    options: JsonPropertyOptions | undefined,
    jsonValue: unknown,
    key: string
  ): void {
    if (!isNotNil(options?.type) || Array.isArray(options?.type)) {
      return;
    }

    const expectedType = options.type;
    let actualType: TypeConstructor | undefined;

    // Get the actual type of the JSON value
    if (typeof jsonValue === 'string') {
      actualType = String;
    } else if (typeof jsonValue === 'number') {
      actualType = Number;
    } else if (typeof jsonValue === 'boolean') {
      actualType = Boolean;
    } else if (isNotNil(jsonValue) && typeof jsonValue === 'object' && jsonValue.constructor) {
      actualType = jsonValue.constructor as ClassConstructor;
    }

    if (isNotNil(actualType) && actualType !== expectedType) {
      throw new TypeError(
        `Type mismatch for property '${key}': expected ${expectedType.name}, got ${actualType.name}`
      );
    }
  }

}
