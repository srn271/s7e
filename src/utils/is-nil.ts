/**
 * Checks if the value is `null` or `undefined`.
 * @param value - The value to check.
 * @template T - The type of the value.
 * @description Checks if the value is `null` or `undefined`.
 * @returns `true` if the value is `null` or `undefined`, otherwise `false`.
 */
export function isNil<T>(
  value: T | null | undefined
): value is null | undefined {
  return value === null || value === undefined;
}
