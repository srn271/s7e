import { JsonClassOptions } from '../models/json-class-options.model';
import type { ClassConstructor } from '../types/class-constructor.type';

type JsonClassMetadata = {
  name: string;
};

/**
 * This metadata registry is used to store class-level options for JSON serialization/deserialization.
 */
const CLASS_METADATA_REGISTRY: WeakMap<ClassConstructor, JsonClassMetadata> = new WeakMap<ClassConstructor, JsonClassMetadata>();

/**
 * Decorator to mark a class for JSON serialization/deserialization.
 * Compatible with TypeScript 5.0+ standard decorators.
 * Stores class-level metadata for serialization configuration.
 *
 * @param options Configuration options for the class
 * @param options.name Name for the JSON class (mandatory)
 *
 * @example
 * ```typescript
 * @JsonClass({ name: 'User' })
 * class User {
 *   @JsonProperty({ name: 'userName', type: String })
 *   name: string;
 *
 *   @JsonProperty({ name: 'userAge', type: Number })
 *   age: number;
 * }
 *
 * @JsonClass({ name: 'Product' })
 * class Product {
 *   @JsonProperty({ name: 'productName', type: String })
 *   name: string;
 * }
 * ```
 */
export function JsonClass(
  options: JsonClassOptions
): (value: ClassConstructor, context: ClassDecoratorContext) => void {
  return function (value: ClassConstructor, context: ClassDecoratorContext): void {
    const metadata: JsonClassMetadata = {
      name: options.name
    };

    CLASS_METADATA_REGISTRY.set(value, metadata);

    // Add the class name to the context for debugging purposes
    context.addInitializer(() => {
      // This initializer runs when the class is defined
      // We can add any class-level initialization logic here if needed in the future
    });
  };
}

/**
 * Get the JSON class metadata for a given constructor.
 * @param ctor The class constructor
 * @returns The JsonClassMetadata or undefined if not decorated with @JsonClass
 */
export function getJsonClassMetadata(ctor: ClassConstructor): JsonClassMetadata | undefined {
  return CLASS_METADATA_REGISTRY.get(ctor);
}

/**
 * Check if a class is decorated with @JsonClass.
 * @param ctor The class constructor
 * @returns True if the class is decorated with @JsonClass
 */
export function isJsonClass(ctor: ClassConstructor): boolean {
  return CLASS_METADATA_REGISTRY.has(ctor);
}

/**
 * Get the JSON class name.
 * @param ctor The class constructor
 * @returns The class name
 */
export function getJsonClassName(ctor: ClassConstructor): string | undefined {
  const metadata = CLASS_METADATA_REGISTRY.get(ctor);
  return metadata?.name;
}
