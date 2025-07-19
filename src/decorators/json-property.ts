import { isNotNil } from "../utils/is-not-nil";

// Type definitions for better type safety
export type PrimitiveConstructor = StringConstructor | NumberConstructor | BooleanConstructor;
export type ClassConstructor<T = any> = new (...args: any[]) => T;
export type TypeConstructor = PrimitiveConstructor | ClassConstructor;

type JsonPropertyMetadata = {
  properties: string[];
  options: Record<string, JsonPropertyOptions>;
};

/**
 * Decorator to mark a property for JSON serialization/deserialization.
 * Compatible with TypeScript 5.0+ standard decorators.
 * Stores property keys in metadata registry.
 *
 * @param options Configuration options for the property
 * @param options.type Type constructor for the property (TypeConstructor for single values, [TypeConstructor] for arrays)
 * @param options.optional Whether the property is optional (default: false)
 *
 * @example
 * ```typescript
 * class User {
 *   @JsonProperty({ type: String })
 *   name: string;
 *
 *   @JsonProperty({ type: [String] })
 *   tags: string[];
 *
 *   @JsonProperty({ type: [Address] })
 *   addresses: Address[];
 * }
 * ```
 */

// This metadata registry is used to store property keys and options for JSON serialization/deserialization.
const METADATA_REGISTRY: WeakMap<ClassConstructor, JsonPropertyMetadata> = new WeakMap<ClassConstructor, JsonPropertyMetadata>();

export interface JsonPropertyOptions {
  /**
   * The type constructor for this property.
   * - For single values: String, Number, Boolean, or a custom class constructor
   * - For arrays: [String], [Number], [Boolean], or [CustomClass]
   */
  type?: TypeConstructor | [TypeConstructor];

  /**
   * If true, property is optional for serialization/deserialization.
   * Optional properties that are undefined will be skipped during serialization,
   * and missing optional properties during deserialization will retain their default values.
   */
  optional?: boolean;
}

export function JsonProperty(
  options?: JsonPropertyOptions
): (value: unknown, context: ClassFieldDecoratorContext) => void {
  return function (value: unknown, context: ClassFieldDecoratorContext<unknown, unknown>): void {
    context.addInitializer(function () {
      const ctor = (this as any).constructor;
      if (!METADATA_REGISTRY.has(ctor)) {
        METADATA_REGISTRY.set(ctor, { properties: [], options: {} });
      }
      const metadata: JsonPropertyMetadata = METADATA_REGISTRY.get(ctor)!;
      if (!metadata.properties.includes(context.name as string)) {
        metadata.properties.push(context.name as string);
        metadata.options[context.name as string] = { optional: false, ...options };
      }
    });
  };
}

export function getJsonProperties(ctor: ClassConstructor): string[] {
  ensureMetadataInitialized(ctor);
  const metadata: JsonPropertyMetadata | undefined = METADATA_REGISTRY.get(ctor);
  return isNotNil(metadata)
    ? metadata.properties
    : [];
}

export function getJsonPropertyOptions(
  ctor: ClassConstructor,
  key: string
): JsonPropertyOptions | undefined {
  ensureMetadataInitialized(ctor);
  const metadata: JsonPropertyMetadata | undefined = METADATA_REGISTRY.get(ctor);
  return isNotNil(metadata)
    ? metadata.options[key]
    : undefined;
}

// Helper function to ensure metadata is initialized by creating a dummy instance
function ensureMetadataInitialized(ctor: ClassConstructor): void {
  // Check if metadata is already available
  if (METADATA_REGISTRY.has(ctor)) {
    return;
  }
  // Try to create a dummy instance to trigger metadata initialization
  try {
    new ctor();
  } catch {
    // If constructor requires parameters, we can't auto-initialize
    // In this case, metadata will only be available after the first manual instance creation
    // This is expected behavior for classes with required constructor parameters
  }
}
