/**
 * Utility class for safe object property checks.
 */
export class ObjectUtils {
  /**
   * Safe own property check for any object.
   */
  public static hasOwnProperty(obj: object, key: PropertyKey): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }
}
