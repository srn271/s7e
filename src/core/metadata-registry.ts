import type { JsonPropertyOptions } from '../models/json-property-options.model';
import type { ClassConstructor } from '../types/class-constructor.type';
import type { PropertyMapping } from '../types/property-mapping.type';

export type JsonPropertyMetadata = {
  properties: Array<PropertyMapping>;
  options: Record<string, JsonPropertyOptions>;
};

export type JsonClassMetadata = {
  name: string;
};

/**
 * Centralized metadata registry for managing all decorator metadata.
 * This class provides a single point of access for property metadata, class metadata, and type registration.
 */
export class MetadataRegistry {
  /**
   * Registry for JSON property metadata (from @JsonProperty decorator)
   */
  private static readonly propertyMetadata: WeakMap<ClassConstructor, JsonPropertyMetadata> = new WeakMap();

  /**
   * Registry for JSON class metadata (from @JsonClass decorator)
   */
  private static readonly classMetadata: WeakMap<ClassConstructor, JsonClassMetadata> = new WeakMap();

  /**
   * Registry for type mapping (class name to constructor)
   */
  private static readonly typeRegistry: Map<string, ClassConstructor> = new Map();

  // === Property Metadata Methods ===

  /**
   * Set property metadata for a class
   */
  public static setPropertyMetadata(ctor: ClassConstructor, metadata: JsonPropertyMetadata): void {
    MetadataRegistry.propertyMetadata.set(ctor, metadata);
  }

  /**
   * Get property metadata for a class
   */
  public static getPropertyMetadata(ctor: ClassConstructor): JsonPropertyMetadata | undefined {
    return MetadataRegistry.propertyMetadata.get(ctor);
  }

  /**
   * Check if property metadata exists for a class
   */
  public static hasPropertyMetadata(ctor: ClassConstructor): boolean {
    return MetadataRegistry.propertyMetadata.has(ctor);
  }

  /**
   * Get all properties for a class
   */
  public static getProperties(ctor: ClassConstructor): Array<PropertyMapping> {
    MetadataRegistry.ensureMetadataInitialized(ctor);
    const metadata: JsonPropertyMetadata | undefined = MetadataRegistry.propertyMetadata.get(ctor);
    return metadata ? metadata.properties : [];
  }

  /**
   * Get property options for a specific property
   */
  public static getPropertyOptions(ctor: ClassConstructor, propertyName: string): JsonPropertyOptions | undefined {
    MetadataRegistry.ensureMetadataInitialized(ctor);
    const metadata = MetadataRegistry.propertyMetadata.get(ctor);
    return metadata ? metadata.options[propertyName] : undefined;
  }

  /**
   * Add a property to a class's metadata
   */
  public static addProperty(ctor: ClassConstructor, property: PropertyMapping, options: JsonPropertyOptions): void {
    if (!MetadataRegistry.propertyMetadata.has(ctor)) {
      MetadataRegistry.propertyMetadata.set(ctor, { properties: [], options: {} });
    }
    const metadata = MetadataRegistry.propertyMetadata.get(ctor)!;

    // Check if property already exists
    const existingProperty = metadata.properties.find(p => p.name === property.name);
    if (!existingProperty) {
      metadata.properties.push(property);
      metadata.options[property.name] = { optional: false, ...options };
    }
  }

  // === Class Metadata Methods ===

  /**
   * Set class metadata for a class
   */
  public static setClassMetadata(ctor: ClassConstructor, metadata: JsonClassMetadata): void {
    MetadataRegistry.classMetadata.set(ctor, metadata);
  }

  /**
   * Get class metadata for a class
   */
  public static getClassMetadata(ctor: ClassConstructor): JsonClassMetadata | undefined {
    MetadataRegistry.ensureMetadataInitialized(ctor);
    return MetadataRegistry.classMetadata.get(ctor);
  }

  /**
   * Check if class metadata exists for a class
   */
  public static hasClassMetadata(ctor: ClassConstructor): boolean {
    return MetadataRegistry.classMetadata.has(ctor);
  }

  /**
   * Get the class name from class metadata
   */
  public static getClassName(ctor: ClassConstructor): string | undefined {
    MetadataRegistry.ensureMetadataInitialized(ctor);
    const metadata = MetadataRegistry.classMetadata.get(ctor);
    return metadata ? metadata.name : undefined;
  }

  /**
   * Check if a class is decorated with @JsonClass
   */
  public static isJsonClass(ctor: ClassConstructor): boolean {
    MetadataRegistry.ensureMetadataInitialized(ctor);
    return MetadataRegistry.classMetadata.has(ctor);
  }

  // === Type Registry Methods ===

  /**
   * Register a type in the type registry
   */
  public static registerType(className: string, ctor: ClassConstructor): void {
    MetadataRegistry.typeRegistry.set(className, ctor);
  }

  /**
   * Get a registered type by class name
   */
  public static getRegisteredType(className: string): ClassConstructor | undefined {
    return MetadataRegistry.typeRegistry.get(className);
  }

  /**
   * Register multiple types
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
   * Clear the type registry
   */
  public static clearTypeRegistry(): void {
    MetadataRegistry.typeRegistry.clear();
  }

  /**
   * Get all registered type names
   */
  public static getRegisteredTypeNames(): string[] {
    return Array.from(MetadataRegistry.typeRegistry.keys());
  }

  /**
   * Ensure metadata is initialized for a class by attempting to create an instance
   */
  public static ensureMetadataInitialized(ctor: ClassConstructor): void {
    // Check if metadata is already available
    if (MetadataRegistry.hasPropertyMetadata(ctor)) {
      return;
    }
    // Try to create a dummy instance to trigger metadata initialization
    try {
      new (ctor as new (...args: any[]) => any)();
    } catch {
      // If constructor requires parameters or is abstract, we can't auto-initialize
      // In this case, metadata will only be available after the first manual instance creation
      // This is expected behavior for classes with required constructor parameters or abstract classes
    }
  }

  /**
   * Clear all metadata (useful for testing)
   */
  public static clearAll(): void {
    MetadataRegistry.typeRegistry.clear();
    // Note: WeakMaps don't have a clear method, but they will be garbage collected
    // when the class constructors are no longer referenced
  }
}
