import { ClassConstructor } from '../types/class-constructor.type';
import { PrimitiveConstructor } from '../types/primitive-constructor.type';
import { TypeConstructor } from '../types/type-constructor.type';
import { isNil } from './is-nil';
import { isNotNil } from './is-not-nil';

export class TypeUtils {

  private static readonly UNKNOWN_TYPE_NAME = 'unknown';

  private constructor() { }

  public static isPrimitiveConstructor<T>(type: TypeConstructor | undefined): type is PrimitiveConstructor {
    return type === String || type === Number || type === Boolean;
  }

  public static isClassConstructor<T>(type: TypeConstructor | undefined): type is ClassConstructor<T> {
    return typeof type === 'function' && !TypeUtils.isPrimitiveConstructor(type);
  }

  public static isTypeConstructor<T>(type: TypeConstructor | undefined): type is TypeConstructor {
    return TypeUtils.isPrimitiveConstructor(type) || TypeUtils.isClassConstructor(type);
  }

  public static isArrayTypeConstructor<T>(type: TypeConstructor | TypeConstructor[]): type is Array<TypeConstructor> {
    return Array.isArray(type)
      && type.every((t: TypeConstructor): t is TypeConstructor => TypeUtils.isTypeConstructor(t));
  }

  public static isSingleTypeConstructor<T>(type: TypeConstructor | TypeConstructor[]): type is TypeConstructor {
    return !Array.isArray(type)
      && TypeUtils.isTypeConstructor(type);
  }

  public static isValidTypeConstructor<T>(type: TypeConstructor | TypeConstructor[]): boolean {
    return TypeUtils.isArrayTypeConstructor(type) || TypeUtils.isSingleTypeConstructor(type);
  }

  public static getTypeName(type: TypeConstructor | undefined): string {
    if (TypeUtils.isTypeConstructor(type)) {
      return type.name;
    }
    return TypeUtils.UNKNOWN_TYPE_NAME;
  }

  public static getArrayTypeName(type: TypeConstructor[]): string {
    const typeName: string = TypeUtils.getTypeName(type[0]);
    return `${typeName}[]`;
  }

  public static getTypeConstructor<T>(type: TypeConstructor | TypeConstructor[]): TypeConstructor {
    if (TypeUtils.isArrayTypeConstructor(type)) {
      return type[0]; // Assuming the first type in the array is the intended type
    } else if (TypeUtils.isSingleTypeConstructor(type)) {
      return type;
    }
    throw new TypeError('Invalid type constructor provided');
  }

  public static getTypeFromValue(value: unknown): TypeConstructor | undefined {
    if (typeof value === 'string') {
      return String;
    } else if (typeof value === 'number') {
      return Number;
    } else if (typeof value === 'boolean') {
      return Boolean;
    } else if (
      isNotNil(value)
      && typeof value === 'object'
      && 'constructor' in value
      && isNotNil(value.constructor)
    ) {
      return value.constructor as ClassConstructor;
    }
    return undefined;
  }

  public static isTypeMatch(expected: TypeConstructor, actual: unknown): boolean {
    const actualType = TypeUtils.getTypeFromValue(actual);
    return actualType === expected || (Array.isArray(expected) && expected.includes(actualType));
  }

  public static validateType(
    expected: TypeConstructor,
    actual: unknown,
    optional: boolean,
    propertyName: string
  ): void {
    if (!TypeUtils.isTypeMatch(expected, actual)) {
      const expectedTypeName: string = TypeUtils.getTypeName(expected);
      const actualType: TypeConstructor | undefined = TypeUtils.getTypeFromValue(actual);
      if (isNil(actualType)) {
        if (!optional) {
          throw new TypeError(`Type mismatch for property '${propertyName}': expected ${expectedTypeName}, got null/undefined`);
        }
        return; // If the value is null/undefined and optional, no error is thrown
      }
      const actualTypeName: string = TypeUtils.getTypeName(actualType);
      throw new TypeError(`Type mismatch for property '${propertyName}': expected ${expectedTypeName}, got ${actualTypeName}`);
    }
  }

}
