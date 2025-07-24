import type { JsonPropertyOptions } from '../models/json-property-options.model';
import type { PropertyMapping } from '../types/property-mapping.type';
import { MetadataRegistry } from '../core/metadata-registry';

/**
 * Decorator to mark a property for JSON serialization/deserialization.
 * Compatible with TypeScript 5.0+ standard decorators.
 * Stores property keys in metadata registry.
 *
 * @param options Configuration options for the property
 * @param options.name The JSON property name (mandatory for minification compatibility)
 * @param options.type Type constructor for the property (TypeConstructor for single values, [TypeConstructor] for arrays). If not provided, type will be inferred at runtime.
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
 *
 *   // Type inferred automatically
 *   @JsonProperty({ name: 'score' })
 *   score: number;
 * }
 * ```
 */
export function JsonProperty(
  options: JsonPropertyOptions,
): (value: unknown, context: ClassFieldDecoratorContext) => void {
  return function (value: unknown, context: ClassFieldDecoratorContext<unknown, unknown>): void {
    context.addInitializer(function () {
      const ctor = (this as any).constructor;
      const propertyName: string = context.name as string;
      const property: PropertyMapping = {
        name: propertyName,
        jsonName: options.name,
      };

      MetadataRegistry.addProperty(ctor, property, options);
    });
  };
}
