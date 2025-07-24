import { describe, expect, test } from 'vitest';
import { S7e } from '../core/s7e';
import { ArrayTestClass, ClassWithNestedArray, NestedClass } from './array-test.fixture';
import { TestUtils } from './test-utils';

describe('Array Support', () => {
  describe('Serialization', () => {
    test('should serialize primitive arrays', () => {
      const instance = new ArrayTestClass();
      instance.stringArray = ['hello', 'world'];
      instance.numberArray = [1, 2, 3];
      instance.booleanArray = [true, false, true];

      const json = S7e.serialize(instance);
      const expectedStructure = {
        stringArray: ['hello', 'world'],
        numberArray: [1, 2, 3],
        booleanArray: [true, false, true],
      };
      TestUtils.expectJsonToHaveStructure(json, expectedStructure);
    });

    test('should serialize empty arrays', () => {
      const instance = new ArrayTestClass();
      const json = S7e.serialize(instance);
      const expectedStructure = {
        stringArray: [],
        numberArray: [],
        booleanArray: [],
      };
      TestUtils.expectJsonToHaveStructure(json, expectedStructure);
    });

    test('should skip optional undefined arrays', () => {
      const instance = new ArrayTestClass();
      instance.stringArray = ['test'];
      instance.numberArray = [1];
      instance.booleanArray = [true];
      // optionalStringArray is undefined

      const json = S7e.serialize(instance);
      const parsed = JSON.parse(json);

      expect(parsed).not.toHaveProperty('optionalStringArray');
    });

    test('should serialize nested object arrays', () => {
      const instance = new ClassWithNestedArray();
      instance.title = 'Test Title';
      instance.nestedArray = [
        new NestedClass('first', 100),
        new NestedClass('second', 200),
      ];

      const json = S7e.serialize(instance);
      const parsed = JSON.parse(json);

      expect(parsed.title).toBe('Test Title');
      expect(parsed.nestedArray).toEqual([
        { name: 'first', value: 100 },
        { name: 'second', value: 200 },
      ]);
    });
  });

  describe('Deserialization', () => {
    test('should deserialize primitive arrays', () => {
      const json = JSON.stringify({
        stringArray: ['hello', 'world'],
        numberArray: [1, 2, 3],
        booleanArray: [true, false, true],
      });

      const instance = S7e.deserialize(json, ArrayTestClass);

      expect(instance.stringArray).toEqual(['hello', 'world']);
      expect(instance.numberArray).toEqual([1, 2, 3]);
      expect(instance.booleanArray).toEqual([true, false, true]);
      expect(instance.optionalStringArray).toBeUndefined();
    });

    test('should deserialize empty arrays', () => {
      const json = JSON.stringify({
        stringArray: [],
        numberArray: [],
        booleanArray: [],
      });

      const instance = S7e.deserialize(json, ArrayTestClass);

      expect(instance.stringArray).toEqual([]);
      expect(instance.numberArray).toEqual([]);
      expect(instance.booleanArray).toEqual([]);
    });

    test('should handle optional arrays', () => {
      const json = JSON.stringify({
        stringArray: ['test'],
        numberArray: [1],
        booleanArray: [true],
        optionalStringArray: ['optional', 'values'],
      });

      const instance = S7e.deserialize(json, ArrayTestClass);

      expect(instance.optionalStringArray).toEqual(['optional', 'values']);
    });

    test('should deserialize nested object arrays', () => {
      const json = JSON.stringify({
        title: 'Test Title',
        nestedArray: [
          { name: 'first', value: 100 },
          { name: 'second', value: 200 },
        ],
      });

      const instance = S7e.deserialize(json, ClassWithNestedArray);

      expect(instance.title).toBe('Test Title');
      expect(instance.nestedArray).toHaveLength(2);
      expect(instance.nestedArray[0]).toBeInstanceOf(NestedClass);
      expect(instance.nestedArray[0].name).toBe('first');
      expect(instance.nestedArray[0].value).toBe(100);
      expect(instance.nestedArray[1]).toBeInstanceOf(NestedClass);
      expect(instance.nestedArray[1].name).toBe('second');
      expect(instance.nestedArray[1].value).toBe(200);
    });

    test('should throw error if array property is not an array', () => {
      const json = JSON.stringify({
        stringArray: 'not an array',
        numberArray: [],
        booleanArray: [],
      });

      expect(() => S7e.deserialize(json, ArrayTestClass)).toThrowError(
        /Type mismatch for property 'stringArray': expected Array, got String/,
      );
    });

    test('should handle null and undefined in arrays', () => {
      const json = JSON.stringify({
        stringArray: ['hello', null, 'world'],
        numberArray: [1, null, 3],
        booleanArray: [true, null, false],
      });

      const instance = S7e.deserialize(json, ArrayTestClass);

      expect(instance.stringArray).toEqual(['hello', null, 'world']);
      expect(instance.numberArray).toEqual([1, null, 3]);
      expect(instance.booleanArray).toEqual([true, null, false]);
    });
  });

  describe('Round-trip serialization', () => {
    test('should maintain data integrity through serialize-deserialize cycle', () => {
      const original = new ClassWithNestedArray();
      original.title = 'Round Trip Test';
      original.nestedArray = [
        new NestedClass('item1', 42),
        new NestedClass('item2', 84),
      ];

      const json = S7e.serialize(original);
      const deserialized = S7e.deserialize(json, ClassWithNestedArray);

      expect(deserialized.title).toBe(original.title);
      expect(deserialized.nestedArray).toHaveLength(original.nestedArray.length);
      expect(deserialized.nestedArray[0].name).toBe(original.nestedArray[0].name);
      expect(deserialized.nestedArray[0].value).toBe(original.nestedArray[0].value);
      expect(deserialized.nestedArray[1].name).toBe(original.nestedArray[1].name);
      expect(deserialized.nestedArray[1].value).toBe(original.nestedArray[1].value);
    });
  });
});
