/**
 * Decorator to mark a property for JSON serialization/deserialization.
 * Compatible with TypeScript 5.0+ standard decorators.
 * Stores property keys in metadata on the class constructor.
 */
const JSON_PROPERTIES_KEY = Symbol('json:properties');

export function JsonProperty(): (
  value: unknown,
  context: ClassFieldDecoratorContext
) => void {
  return function (value, context) {
    context.addInitializer(function () {
      const ctor = (this as any).constructor;
      if (!Array.isArray(ctor[JSON_PROPERTIES_KEY])) {
        ctor[JSON_PROPERTIES_KEY] = [];
      }
      ctor[JSON_PROPERTIES_KEY].push(context.name);
    });
  };
}

export function getJsonProperties(ctor: Function): string[] {
  return (ctor as any)[JSON_PROPERTIES_KEY] || [];
}
