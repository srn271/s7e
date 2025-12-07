/**
 * Context information passed to converter methods.
 */
export interface ConverterContext<T extends object = object> {
  /**
   * The parent object containing the property being converted.
   */
  parent: T;

  /**
   * The name of the property being converted.
   */
  propertyName: string;
}

/**
 * Interface for custom property converters that handle serialization and deserialization.
 * Useful for converting third-party types (e.g., DateTime from Luxon) or custom data structures.
 *
 * @template T The TypeScript type of the property
 * @template S The serialized type (usually string, number, or plain object)
 */
export interface Converter<T = unknown, S = unknown, P extends object = object> {
  /**
   * Convert a TypeScript value to its serialized representation.
   * @param value The value to serialize
   * @param context Context information including parent object and property name (always provided with both fields)
   * @returns The serialized value
   */
  serialize: (value: T, context: ConverterContext<P>) => S;

  /**
   * Convert a serialized value back to its TypeScript representation.
   * @param value The serialized value to deserialize
   * @param context Context information including parent object and property name (always provided with both fields)
   * @returns The deserialized value
   */
  deserialize: (value: S, context: ConverterContext<P>) => T;
}
