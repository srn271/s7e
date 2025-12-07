import type { Converter } from '../types/converter.type';
import type { TypeConstructor } from '../types/type-constructor.type';

/**
 * Options for JSON properties used in serialization/deserialization.
 * This interface defines the structure for property options that can be used with the `@JsonProperty` decorator.
 */
export interface JsonPropertyOptions {
  /**
   * The JSON property name to use for serialization/deserialization.
   * This is mandatory to ensure compatibility with minified code.
   */
  name: string;

  /**
   * The type constructor for this property.
   * - For single values: String, Number, Boolean, or a custom class constructor
   * - For arrays: [String], [Number], [Boolean], or [CustomClass]
   * - If not provided, the type will be inferred from the value during serialization/deserialization
   */
  type?: TypeConstructor | [TypeConstructor];

  /**
   * If true, property is optional for serialization/deserialization.
   * Optional properties that are undefined will be skipped during serialization,
   * and missing optional properties during deserialization will retain their default values.
   */
  optional?: boolean;

  /**
   * Custom converter for serialization/deserialization of this property.
   * Useful for converting third-party types or custom data structures.
   * When provided, this converter takes precedence over the default type-based conversion.
   */
  converter?: Converter<any, any, any>;
}
