import { isNil } from './is-nil';

/**
 * Checks if the value is not `null` or `undefined`.
 * @param value - The value to check.
 * @template T - The type of the value.
 * @description Checks if the value is not `null` or `undefined`.
 * @returns `true` if the value is not `null` or `undefined`, otherwise `false`.
 */
export function isNotNil<T>(value: T): value is NonNullable<T> {
  return !isNil(value);
}
