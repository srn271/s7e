import { JsonClassOptions } from '../models/json-class-options.model';
import type { ClassConstructor } from '../types/class-constructor.type';
import { MetadataRegistry } from '../core/metadata-registry';

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
  options: JsonClassOptions,
): (value: ClassConstructor, context: ClassDecoratorContext) => void {
  return function (value: ClassConstructor, context: ClassDecoratorContext): void {
    const metadata = {
      name: options.name,
    };

    MetadataRegistry.setClassMetadata(value, metadata);

    // Add the class name to the context for debugging purposes
    context.addInitializer(() => {
      // This initializer runs when the class is defined
      // We can add any class-level initialization logic here if needed in the future
    });
  };
}
