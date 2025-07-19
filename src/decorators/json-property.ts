import type { JsonPropertyOptions } from '../models/json-property-options.model';
import type { ClassConstructor } from '../types/class-constructor.type';
import type { PropertyMapping } from '../types/property-mapping.type';
import { isNil } from '../utils/is-nil';
import { isNotNil } from '../utils/is-not-nil';

type JsonPropertyMetadata = {
  properties: Array<PropertyMapping>;
  options: Record<string, JsonPropertyOptions>;
};

/**
 * This metadata registry is used to store property keys and options for JSON serialization/deserialization.
 */
const METADATA_REGISTRY: WeakMap<ClassConstructor, JsonPropertyMetadata> = new WeakMap<ClassConstructor, JsonPropertyMetadata>();

/**
 * Decorator to mark a property for JSON serialization/deserialization.
 * Compatible with TypeScript 5.0+ standard decorators.
 * Stores property keys in metadata registry.
 *
 * @param options Configuration options for the property
 * @param options.name The JSON property name (mandatory for minification compatibility)
 * @param options.type Type constructor for the property (TypeConstructor for single values, [TypeConstructor] for arrays)
 * @param options.optional Whether the property is optional (default: false)
 *
 * @example
 * ```typescript
 * class User {
 *   @JsonProperty({ name: 'userName', type: String })
 *   name: string;
 *
 *   @JsonProperty({ name: 'userTags', type: [String] })
 *   tags: string[];
 *
 *   @JsonProperty({ name: 'addresses', type: [Address] })
 *   addresses: Address[];
 * }
 * ```
 */
export function JsonProperty(
  options: JsonPropertyOptions
): (value: unknown, context: ClassFieldDecoratorContext) => void {
  return function (value: unknown, context: ClassFieldDecoratorContext<unknown, unknown>): void {
    context.addInitializer(function () {
      const ctor = (this as any).constructor;
      if (!METADATA_REGISTRY.has(ctor)) {
        METADATA_REGISTRY.set(ctor, { properties: [], options: {} });
      }
      const metadata: JsonPropertyMetadata = METADATA_REGISTRY.get(ctor)!;
      const name: string = context.name as string;
      const existingProperty: PropertyMapping | undefined = metadata.properties.find(p => p.name === name);

      if (isNil(existingProperty)) {
        metadata.properties.push({
          name,
          jsonName: options.name
        });
        metadata.options[name] = { optional: false, ...options };
      }
    });
  };
}

export function getJsonProperties(ctor: ClassConstructor): Array<PropertyMapping> {
  ensureMetadataInitialized(ctor);
  const metadata: JsonPropertyMetadata | undefined = METADATA_REGISTRY.get(ctor);
  return isNotNil(metadata)
    ? metadata.properties
    : [];
}

export function getJsonPropertyOptions(
  ctor: ClassConstructor,
  name: string
): JsonPropertyOptions | undefined {
  ensureMetadataInitialized(ctor);
  const metadata: JsonPropertyMetadata | undefined = METADATA_REGISTRY.get(ctor);
  return isNotNil(metadata)
    ? metadata.options[name]
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
