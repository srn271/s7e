import type { JsonPropertyOptions } from '../models/json-property-options.model';
import type { ClassConstructor } from '../types/class-constructor.type';
import type { PropertyMapping } from '../types/property-mapping.type';
import type { TypeConstructor } from '../types/type-constructor.type';
import { isNil } from '../utils/is-nil';
import { isNotNil } from '../utils/is-not-nil';
import { ObjectUtils } from '../utils/object-utils';
import { TypeUtils } from '../utils/type.utils';
import { MetadataRegistry } from './metadata-registry';

/**
 * Utility class for serializing and deserializing TypeScript class instances to and from JSON.
 */
export class S7e {

  /**
   * The property name used for type discrimination in polymorphic serialization.
   * Defaults to '$type'.
   */
  private static discriminatorProperty: string = '$type';

  /**
   * Set the discriminator property name used for type discrimination.
   * @param propertyName The name of the discriminator property (defaults to '$type')
   */
  public static setDiscriminatorProperty(propertyName: string): void {
    S7e.discriminatorProperty = propertyName;
  }

  /**
   * Get the current discriminator property name.
   * @returns The discriminator property name
   */
  public static getDiscriminatorProperty(): string {
    return S7e.discriminatorProperty;
  }

  /**
   * Register types for polymorphic deserialization.
   * @param types Array of class constructors to register
   */
  public static registerTypes(types: ClassConstructor[]): void {
    for (const type of types) {
      const className = MetadataRegistry.getClassName(type);
      if (className) {
        MetadataRegistry.registerType(className, type);
      }
    }
  }

  /**
   * Get a registered type by name.
   * @param name The class name
   * @returns The class constructor or undefined if not found
   */
  public static getRegisteredType(name: string): ClassConstructor | undefined {
    return MetadataRegistry.getRegisteredType(name);
  }

  /**
   * Clear the type registry.
   */
  public static clearTypeRegistry(): void {
    MetadataRegistry.clearTypeRegistry();
  }

  /**
   * Serialize a class instance to a plain object (POJO).
   * @param instance - The class instance to serialize.
   * @returns The plain object representation of the instance.
   */
  public static serialize<T extends object>(instance: T): Record<string, unknown>;
  public static serialize<T extends object>(instance: T | null | undefined): Record<string, unknown> | null | undefined;

  /**
   * Serialize a class instance to a plain object (POJO) with explicit class constructor.
   * @param instance - The class instance to serialize.
   * @param cls - The class constructor to use (takes precedence over discriminator).
   * @returns The plain object representation of the instance.
   */
  public static serialize<T extends object>(instance: T, cls: ClassConstructor<T>): Record<string, unknown>;
  public static serialize<T extends object>(instance: T | null | undefined, cls: ClassConstructor<T>): Record<string, unknown> | null | undefined;

  /**
   * Serialize an array of class instances to an array of plain objects.
   * @param instances - The array of class instances to serialize.
   * @returns The array of plain object representations.
   */
  public static serialize<T extends object>(instances: T[]): Record<string, unknown>[];
  public static serialize<T extends object>(instances: (T | null | undefined)[]): (Record<string, unknown> | null | undefined)[];

  /**
   * Serialize an array of class instances to an array of plain objects with explicit class constructor.
   * @param instances - The array of class instances to serialize.
   * @param cls - The class constructor to use for all instances.
   * @returns The array of plain object representations.
   */
  public static serialize<T extends object>(instances: T[], cls: ClassConstructor<T>): Record<string, unknown>[];
  public static serialize<T extends object>(instances: (T | null | undefined)[], cls: ClassConstructor<T>): (Record<string, unknown> | null | undefined)[];

  /**
   * Implementation of the overloaded serialize method.
   */
  public static serialize<T extends object>(
    instanceOrArray: T | null | undefined | (T | null | undefined)[],
    cls?: ClassConstructor<any>,
  ): Record<string, unknown> | null | undefined | (Record<string, unknown> | null | undefined)[] {
    if (Array.isArray(instanceOrArray)) {
      return instanceOrArray.map((instance: T | null | undefined): Record<string, unknown> | null | undefined => {
        return S7e.serializeSingle(instance, cls);
      });
    }
    return S7e.serializeSingle(instanceOrArray, cls);
  }

  /**
   * Serialize a single instance to a plain object.
   */
  private static serializeSingle<T extends object>(
    instance: T | null | undefined,
    cls?: ClassConstructor<any>,
  ): Record<string, unknown> | null | undefined {
    if (isNil(instance)) {
      return instance;
    }

    // Use provided class constructor or fall back to instance constructor
    const ctor: ClassConstructor = cls ?? (instance as NonNullable<T>).constructor as ClassConstructor;
    const properties: PropertyMapping[] = MetadataRegistry.getProperties(ctor);
    const obj: Record<string, unknown> = {};

    // Add discriminator property if class is decorated with @JsonClass
    const className = MetadataRegistry.getClassName(ctor);
    if (className) {
      obj[S7e.discriminatorProperty] = className;
    }

    for (const property of properties) {
      const options: JsonPropertyOptions | undefined = MetadataRegistry.getPropertyOptions(ctor, property.name);
      const value: unknown = (instance as any)[property.name];
      if (options?.optional && typeof value === 'undefined') {
        continue; // skip undefined optional properties
      }

      obj[property.jsonName] = S7e.serializeValue(options, value, instance);
    }
    return obj;
  }

  /**
   * Deserialize a JSON string or object to a class instance.
   * @param json - The JSON string or object to deserialize.
   * @param cls - The class constructor to instantiate.
   * @returns An instance of the class with properties from the JSON.
   */
  public static deserialize<T extends object>(
    json: string | Record<string, unknown>,
    cls: ClassConstructor<T>
  ): T;

  /**
   * Deserialize a JSON string or object to a class instance using class name.
   * @param json - The JSON string or object to deserialize.
   * @param className - The name of the class to instantiate.
   * @returns An instance of the class with properties from the JSON.
   */
  public static deserialize(
    json: string | Record<string, unknown>,
    className: string
  ): object;

  /**
   * Deserialize a JSON string or array to class instances (supports arrays for polymorphic deserialization).
   * @param json - The JSON string or array to deserialize.
   * @param cls - Array containing the base class constructor for polymorphic deserialization.
   * @returns An array of instances with proper types based on discriminator.
   */
  public static deserialize<T extends object>(
    json: string | Record<string, unknown>[],
    cls: [ClassConstructor<T>]
  ): T[];

  /**
   * Deserialize a JSON string or object to a class instance using only the discriminator value.
   * @param json - The JSON string or object to deserialize (must contain discriminator property).
   * @returns An instance of the class determined by the discriminator value.
   */
  public static deserialize(json: string | Record<string, unknown>): object;

  /**
   * Implementation of the overloaded deserialize method.
   */
  public static deserialize<T extends object>(
    json: string | Record<string, unknown> | Record<string, unknown>[],
    clsOrName?: ClassConstructor<T> | string | [ClassConstructor<T>],
  ): T | object | T[] {
    const obj = typeof json === 'string' ? JSON.parse(json) : json;

    // Handle case where no type is provided - use discriminator only
    if (clsOrName === undefined) {
      return S7e.deserializeByDiscriminatorFromObject(obj as Record<string, unknown>);
    }

    // Handle array type for polymorphic deserialization
    if (Array.isArray(clsOrName)) {
      return S7e.deserializeArrayFromObject(obj as Record<string, unknown>[], clsOrName[0]);
    }

    // Handle string class name
    if (typeof clsOrName === 'string') {
      return S7e.deserializeByNameFromObject(obj as Record<string, unknown>, clsOrName);
    }

    // Handle direct constructor reference
    return S7e.deserializeSingleFromObject(obj as Record<string, unknown>, clsOrName);
  }

  /**
   * Deserialize by discriminator only from object - extract type from object discriminator property
   */
  private static deserializeByDiscriminatorFromObject(obj: Record<string, unknown>): object {
    try {
      // Look for discriminator property in the object
      if (isNil(obj) || typeof obj !== 'object') {
        throw new Error('Object must be a valid object to deserialize by discriminator');
      }

      // Get discriminator value from object
      const discriminatorValue = obj[S7e.discriminatorProperty];
      if (isNil(discriminatorValue) || typeof discriminatorValue !== 'string') {
        throw new Error(`No discriminator property '${S7e.discriminatorProperty}' found in object or value is not a string`);
      }

      // Find the registered class for this discriminator value
      const registeredClass = S7e.getRegisteredType(discriminatorValue);
      if (isNil(registeredClass)) {
        throw new Error(`No registered class found for discriminator value: ${discriminatorValue}`);
      }

      // Deserialize using the found class
      return S7e.deserializeSingleFromObject(obj, registeredClass);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to deserialize by discriminator: ${error.message}`);
      }
      throw new Error('Failed to deserialize by discriminator: Unknown error');
    }
  }

  /**
   * Deserialize a single object using a class constructor from object.
   */
  private static deserializeSingleFromObject<T extends object>(
    obj: Record<string, unknown>,
    cls: ClassConstructor<T>,
  ): T {
    // Check for discriminator-based type resolution
    const resolvedClass = S7e.resolveClassFromDiscriminator(obj, cls);
    if (resolvedClass !== cls) {
      return S7e.deserializeSingleFromObject(obj, resolvedClass);
    }

    // Create instance and populate properties
    const instance = S7e.createInstance(cls);
    S7e.populateInstanceProperties(instance, obj, cls);
    return instance;
  }

  /**
   * Resolve the actual class to use based on discriminator property.
   */
  private static resolveClassFromDiscriminator<T extends object>(
    obj: Record<string, unknown>,
    fallbackClass: ClassConstructor<T>,
  ): ClassConstructor<T> {
    const discriminatorValue = obj[S7e.discriminatorProperty];
    if (discriminatorValue && typeof discriminatorValue === 'string') {
      const registeredType = S7e.getRegisteredType(discriminatorValue);
      if (registeredType && registeredType !== fallbackClass) {
        return registeredType as ClassConstructor<T>;
      }
    }
    return fallbackClass;
  }

  /**
   * Create an instance of the given class.
   */
  private static createInstance<T extends object>(cls: ClassConstructor<T>): T {
    try {
      return new (cls as new (...args: any[]) => T)();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Cannot instantiate class '${cls.name}'. Make sure it's not abstract and a concrete type is available via discriminator. Original error: ${errorMessage}`);
    }
  }

  /**
   * Populate instance properties from JSON object.
   */
  private static populateInstanceProperties<T extends object>(
    instance: T,
    obj: Record<string, unknown>,
    cls: ClassConstructor<T>,
  ): void {
    const properties: PropertyMapping[] = MetadataRegistry.getProperties(cls);
    for (const property of properties) {
      const options: JsonPropertyOptions | undefined = MetadataRegistry.getPropertyOptions(cls, property.name);
      if (isNil(options)) {
        throw new Error(`No options found for property '${property.name}' in class '${cls.name}'`);
      }
      if (!ObjectUtils.hasOwnProperty(obj, property.jsonName)) {
        if (options.optional === true) {
          continue;
        }
        throw new Error(`Missing required property '${property.jsonName}' in JSON during deserialization.`);
      }

      const jsonValue: unknown = obj[property.jsonName];
      S7e.validateType(options, jsonValue, property.jsonName);
      const value = S7e.deserializeValue(options, jsonValue, instance);
      (instance as any)[property.name] = value;
    }
  }

  /**
   * Deserialize using a class name from the type registry from object.
   */
  private static deserializeByNameFromObject(obj: Record<string, unknown>, className: string): object {
    const cls = S7e.getRegisteredType(className);
    if (isNil(cls)) {
      throw new Error(`Class '${className}' is not registered. Use S7e.registerTypes() to register it.`);
    }
    return S7e.deserializeSingleFromObject(obj, cls);
  }

  /**
   * Deserialize an array with polymorphic type resolution from object.
   */
  private static deserializeArrayFromObject<T extends object>(
    array: Record<string, unknown>[],
    baseClass: ClassConstructor<T>,
  ): T[] {
    if (!Array.isArray(array)) {
      throw new TypeError('Expected array for polymorphic deserialization');
    }

    return array.map((item: Record<string, unknown>) => {
      const discriminatorValue = item[S7e.discriminatorProperty];

      if (discriminatorValue && typeof discriminatorValue === 'string') {
        const registeredType = S7e.getRegisteredType(discriminatorValue);
        if (registeredType) {
          return S7e.deserializeSingleFromObject(item, registeredType as ClassConstructor<T>);
        }
      }

      // Fallback to base class if no discriminator or type not found
      return S7e.deserializeSingleFromObject(item, baseClass);
    });
  }

  private static serializeValue<T extends object>(
    options: JsonPropertyOptions | undefined,
    value: unknown,
    instance: T,
  ): unknown {
    // Use custom converter if provided
    if (isNotNil(options?.converter)) {
      const context = {
        parent: instance,
        propertyName: options.name,
      };

      // Handle array with converter
      if (Array.isArray(value)) {
        return value.map((item: unknown): unknown => {
          return isNil(item)
            ? item
            : options.converter!.serialize(item, context);
        });
      }
      // Handle single value with converter
      if (isNotNil(value)) {
        return options.converter.serialize(value, context);
      }
      return value;
    }

    // Handle array serialization
    if (options?.type && TypeUtils.isArrayTypeConstructor(options.type) && Array.isArray(value)) {
      return value.map((item: unknown): unknown => {
        // If the array item is an object with a serialize method (another class), serialize it
        if (isNotNil(item) && typeof item === 'object' && typeof item.constructor === 'function'
          && MetadataRegistry.getProperties(item.constructor as ClassConstructor).length > 0
        ) {
          return S7e.serializeSingle(item);
        }
        return item;
      });
    }

    // If no type is specified and value is an array, try to serialize array items if they are objects
    if (isNil(options?.type) && Array.isArray(value)) {
      return value.map((item: unknown): unknown => {
        // If the array item is an object with serializable properties, serialize it
        if (isNotNil(item) && typeof item === 'object' && typeof item.constructor === 'function'
          && MetadataRegistry.getProperties(item.constructor as ClassConstructor).length > 0
        ) {
          return S7e.serializeSingle(item);
        }
        return item;
      });
    }

    // Regular single value serialization
    return value;
  }

  private static deserializeValue<T extends object>(
    options: JsonPropertyOptions,
    jsonValue: unknown,
    instance: T,
  ): unknown {
    // Use custom converter if provided
    if (isNotNil(options.converter)) {
      const context = {
        parent: instance,
        propertyName: options.name,
      };
      // Handle array with converter
      if (Array.isArray(jsonValue)) {
        return jsonValue.map((item: unknown): unknown => {
          return isNil(item)
            ? item
            : options.converter!.deserialize(item, context);
        });
      }
      // Handle single value with converter
      if (isNotNil(jsonValue)) {
        return options.converter.deserialize(jsonValue, context);
      }
      return jsonValue;
    }

    // If no type is provided, try to infer from the value
    if (isNil(options.type)) {
      return S7e.deserializeValueWithoutType(jsonValue);
    }

    // Handle array deserialization
    if (TypeUtils.isArrayTypeConstructor(options.type)) {
      if (!Array.isArray(jsonValue)) {
        throw new TypeError(
          `Type mismatch for property '${options.name}': expected Array, got ${typeof jsonValue}`,
        );
      }
      const elementType: TypeConstructor = options.type[0];
      return jsonValue.map((item: unknown): unknown => {
        if (isNotNil(item) && isNotNil(elementType)) {
          // If elementType is a class constructor with JsonProperty decorators, deserialize as object
          if (TypeUtils.isClassConstructor(elementType)
            && MetadataRegistry.getProperties(elementType).length > 0) {
            return S7e.deserializeSingleFromObject(
              item as Record<string, unknown>,
              elementType as ClassConstructor<object>,
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

  /**
   * Deserialize a value when no type information is provided.
   * Uses runtime type inference based on the JSON value.
   */
  private static deserializeValueWithoutType(jsonValue: unknown): unknown {
    // Handle null/undefined
    if (isNil(jsonValue)) {
      return jsonValue;
    }

    // Handle arrays
    if (Array.isArray(jsonValue)) {
      return jsonValue.map((item: unknown): unknown => {
        return S7e.deserializeValueWithoutType(item);
      });
    }

    // Handle objects - check if they have discriminator for custom classes
    if (typeof jsonValue === 'object' && jsonValue !== null) {
      const obj = jsonValue as Record<string, unknown>;

      // Check for discriminator property to deserialize as custom class
      const discriminatorValue = obj[S7e.discriminatorProperty];
      if (discriminatorValue && typeof discriminatorValue === 'string') {
        const registeredClass = S7e.getRegisteredType(discriminatorValue);
        if (registeredClass) {
          return S7e.deserializeSingleFromObject(obj, registeredClass);
        }
      }

      // For plain objects, recursively deserialize properties
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = S7e.deserializeValueWithoutType(value);
      }
      return result;
    }

    // For primitive values, return as-is (they're already the correct type from JSON parsing)
    return jsonValue;
  }

  private static convertValue(
    type: TypeConstructor,
    value: unknown,
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
    name: string,
  ): void {
    // Skip validation if no type is provided - rely on runtime inference
    if (isNil(options.type)) {
      return;
    }

    if (TypeUtils.isArrayTypeConstructor(options.type)) {
      S7e.validateArrayType(jsonValue, name);
    } else {
      S7e.validateSingleType(options, jsonValue, name);
    }
  }

  private static validateArrayType(
    jsonValue: unknown,
    name: string,
  ): void {
    if (!Array.isArray(jsonValue)) {
      const actualType = TypeUtils.getTypeFromValue(jsonValue);
      const actualTypeName = TypeUtils.getTypeName(actualType);
      throw new TypeError(
        `Type mismatch for property '${name}': expected Array, got ${actualTypeName}`,
      );
    }
    // No need to validate individual array items here - they are validated during deserialization
  }

  private static validateSingleType(
    options: JsonPropertyOptions,
    jsonValue: unknown,
    name: string,
  ): void {
    // Skip validation if no type is provided
    if (isNil(options.type)) {
      return;
    }

    if (TypeUtils.isArrayTypeConstructor(options.type)) {
      throw new TypeError(
        `Type mismatch for property '${name}': expected single value, got Array`,
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
      name,
    );
  }

}
