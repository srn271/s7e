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
    return JSON.stringify(instance);
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
    return Object.assign(new cls() as object, JSON.parse(json)) as T;
  }
}
