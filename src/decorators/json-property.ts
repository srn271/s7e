import { isNotNil } from "../utils/is-not-nil";

type JsonPropertyMetadata = {
  properties: string[];
  options: Record<string, JsonPropertyOptions>;
};

/**
 * Decorator to mark a property for JSON serialization/deserialization.
 * Compatible with TypeScript 5.0+ standard decorators.
 * Stores property keys in metadata registry.
 */

// This metadata registry is used to store property keys and options for JSON serialization/deserialization.
const METADATA_REGISTRY: WeakMap<Function, JsonPropertyMetadata> = new WeakMap<Function, JsonPropertyMetadata>();

export interface JsonPropertyOptions {
  type?: Function;
  optional?: boolean; // If true, property is optional for serialization/deserialization
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

export function getJsonProperties(ctor: Function): string[] {
  ensureMetadataInitialized(ctor);
  const metadata: JsonPropertyMetadata | undefined = METADATA_REGISTRY.get(ctor);
  return isNotNil(metadata)
    ? metadata.properties
    : [];
}

export function getJsonPropertyOptions(
  ctor: Function,
  key: string
): JsonPropertyOptions | undefined {
  ensureMetadataInitialized(ctor);
  const metadata: JsonPropertyMetadata | undefined = METADATA_REGISTRY.get(ctor);
  return isNotNil(metadata)
    ? metadata.options[key]
    : undefined;
}

// Helper function to ensure metadata is initialized by creating a dummy instance
function ensureMetadataInitialized(ctor: Function): void {
  // Check if metadata is already available
  if (METADATA_REGISTRY.has(ctor)) {
    return;
  }
  // Try to create a dummy instance to trigger metadata initialization
  try {
    new (ctor as any)();
  } catch {
    // If constructor requires parameters, we can't auto-initialize
    // In this case, metadata will only be available after the first manual instance creation
    // This is expected behavior for classes with required constructor parameters
  }
}
