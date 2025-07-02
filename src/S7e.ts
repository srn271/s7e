import { getJsonProperties } from './json-property';
import { ObjectUtils } from './object-utils';

/**
 * Utility class for serializing and deserializing TypeScript class instances to and from JSON.
 */
export class S7e {
  /**
   * Serialize a class instance to a JSON string.
   * @param instance - The class instance to serialize.
   * @returns The JSON string representation of the instance.
   */
  public static serialize<T>(instance: T): string {
    if (!instance) return JSON.stringify(instance);
    const ctor = instance.constructor;
    const props = getJsonProperties(ctor);
    const obj: Record<string, unknown> = {};
    for (const key of props) {
      obj[key] = (instance as any)[key];
    }
    return JSON.stringify(obj);
  }

  /**
   * Deserialize a JSON string to a class instance.
   * @param cls - The class constructor to instantiate.
   * @param json - The JSON string to deserialize.
   * @returns An instance of the class with properties from the JSON.
   */
  public static deserialize<T extends object>(
    cls: { new (...args: any[]): T },
    json: string
  ): T {
    const obj: Record<string, unknown> = JSON.parse(json);
    const properties: string[] = getJsonProperties(cls);
    const instance: T = new cls();
    for (const key of properties) {
      if (ObjectUtils.hasOwnProperty(obj, key)) {
        (instance as any)[key] = obj[key];
      }
    }
    return instance;
  }
}
