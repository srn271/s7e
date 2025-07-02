/**
 * Decorator to mark a property for JSON serialization/deserialization.
 * Compatible with TypeScript 5.0+ standard decorators.
 * Stores property keys in metadata on the class constructor.
 */
const JSON_PROPERTIES_KEY = Symbol('json:properties');
const JSON_PROPERTY_OPTIONS_KEY = Symbol('json:property-options');

export interface JsonPropertyOptions {
  type?: Function;
}

export function JsonProperty(
  options?: JsonPropertyOptions
): (value: unknown, context: ClassFieldDecoratorContext) => void {
  return function (value, context) {
    context.addInitializer(function () {
      const ctor = (this as any).constructor;
      if (!Array.isArray(ctor[JSON_PROPERTIES_KEY])) {
        ctor[JSON_PROPERTIES_KEY] = [];
      }
      ctor[JSON_PROPERTIES_KEY].push(context.name);
      // Store options for this property
      if (!ctor[JSON_PROPERTY_OPTIONS_KEY]) {
        ctor[JSON_PROPERTY_OPTIONS_KEY] = {};
      }
      ctor[JSON_PROPERTY_OPTIONS_KEY][context.name] = options ?? {};
    });
  };
}

export function getJsonProperties(ctor: Function): string[] {
  return (ctor as any)[JSON_PROPERTIES_KEY] || [];
}

export function getJsonPropertyOptions(
  ctor: Function,
  key: string
): JsonPropertyOptions | undefined {
  return (ctor as any)[JSON_PROPERTY_OPTIONS_KEY]?.[key];
}
