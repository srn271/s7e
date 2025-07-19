import {
  getJsonProperties,
  getJsonPropertyOptions,
} from '../decorators/json-property';
import type { JsonPropertyOptions } from '../models/json-property-options.model';
import type { ClassConstructor } from '../types/class-constructor.type';
import type { PropertyMapping } from '../types/property-mapping.type';
import type { TypeConstructor } from '../types/type-constructor.type';
import { isNil } from '../utils/is-nil';
import { isNotNil } from '../utils/is-not-nil';
import { ObjectUtils } from '../utils/object-utils';
import { TypeUtils } from '../utils/type.utils';

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
    if (isNil(instance)) {
      return JSON.stringify(instance);
    }
    const ctor: ClassConstructor = (instance as NonNullable<T>).constructor as ClassConstructor;
    const properties: PropertyMapping[] = getJsonProperties(ctor);
    const obj: Record<string, unknown> = {};
    for (const property of properties) {
      const options: JsonPropertyOptions | undefined = getJsonPropertyOptions(ctor, property.name);
      const value: unknown = (instance as any)[property.name];
      if (options?.optional && typeof value === 'undefined') {
        continue; // skip undefined optional properties
      }

      obj[property.jsonName] = S7e.serializeValue(options, value);
    }
    return JSON.stringify(obj);
  }

  private static serializeValue(
    options: JsonPropertyOptions | undefined,
    value: unknown
  ): unknown {
    // Handle array serialization
    if (options?.type && TypeUtils.isArrayTypeConstructor(options.type) && Array.isArray(value)) {
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
    const properties: PropertyMapping[] = getJsonProperties(cls);
    const instance: T = new cls();
    for (const property of properties) {
      const options: JsonPropertyOptions | undefined = getJsonPropertyOptions(cls, property.name);
      if (isNil(options)) {
        throw new Error(`No options found for property '${property.name}' in class '${cls.name}'`);
      }
      if (!ObjectUtils.hasOwnProperty(obj, property.jsonName)) {
        // If property is optional and not present in JSON, skip assignment (use default)
        if (options.optional === true) {
          continue;
        }
        // If not optional, throw error
        throw new Error(`Missing required property '${property.jsonName}' in JSON during deserialization.`);
      }
      // If property is present in JSON, always deserialize, even if optional
      const jsonValue: unknown = obj[property.jsonName];
      S7e.validateType(options, jsonValue, property.jsonName);

      const value = S7e.deserializeValue(options, jsonValue);
      (instance as any)[property.name] = value;
    }
    return instance;
  }

  private static deserializeValue(
    options: JsonPropertyOptions,
    jsonValue: unknown
  ): unknown {
    // Handle array deserialization
    if (TypeUtils.isArrayTypeConstructor(options.type)) {
      if (!Array.isArray(jsonValue)) {
        throw new TypeError(
          `Type mismatch for property '${options.name}': expected Array, got ${typeof jsonValue}`
        );
      }
      const elementType: TypeConstructor = options.type[0];
      return jsonValue.map((item: unknown): unknown => {
        if (isNotNil(item) && isNotNil(elementType)) {
          // If elementType is a class constructor with JsonProperty decorators, deserialize as object
          if (TypeUtils.isClassConstructor(elementType) &&
            getJsonProperties(elementType).length > 0) {
            return S7e.deserialize(
              JSON.stringify(item),
              elementType as ClassConstructor<object>
            );
          }
          // Otherwise use the type constructor for primitive types
          return S7e.convertValue(elementType, item);
        }
        return item;
      });
    }

    // Regular single value deserialization
    const typeFn: TypeConstructor = TypeUtils.getTypeConstructor(options.type);

    return isNotNil(jsonValue)
      ? S7e.convertValue(typeFn, jsonValue)
      : jsonValue;
  }

  private static convertValue(
    type: TypeConstructor,
    value: unknown
  ): unknown {
    // Handle primitive type conversions
    if (type === String) {
      return String(value);
    } else if (type === Number) {
      return Number(value);
    } else if (type === Boolean) {
      return Boolean(value);
    }
    // For class constructors, we should not convert here as they need proper deserialization
    return value;
  }

  private static validateType(
    options: JsonPropertyOptions,
    jsonValue: unknown,
    name: string
  ): void {
    if (TypeUtils.isArrayTypeConstructor(options.type)) {
      S7e.validateArrayType(options, jsonValue, name);
    } else {
      S7e.validateSingleType(options, jsonValue, name);
    }
  }

  private static validateArrayType(
    options: JsonPropertyOptions,
    jsonValue: unknown,
    name: string
  ): void {
    if (!Array.isArray(jsonValue)) {
      const actualType = TypeUtils.getTypeFromValue(jsonValue);
      const actualTypeName = TypeUtils.getTypeName(actualType);
      throw new TypeError(
        `Type mismatch for property '${name}': expected Array, got ${actualTypeName}`
      );
    }
    // No need to validate individual array items here - they are validated during deserialization
  }

  private static validateSingleType(
    options: JsonPropertyOptions,
    jsonValue: unknown,
    name: string
  ): void {
    if (TypeUtils.isArrayTypeConstructor(options.type)) {
      throw new TypeError(
        `Type mismatch for property '${name}': expected single value, got Array`
      );
    }

    if (isNil(jsonValue)) {
      // Skip validation for null/undefined - let the deserializeValue handle conversion
      return;
    }

    TypeUtils.validateType(
      options.type,
      jsonValue,
      options.optional ?? false,
      name
    );
  }

}
