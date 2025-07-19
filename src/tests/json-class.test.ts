import { describe, expect, it } from 'vitest';
import {
  getJsonClassMetadata,
  isJsonClass,
  getJsonClassName
} from '../decorators/json-class';
import { Product, TestUser } from './json-class.fixture';
import { User } from './user.fixture';

describe('JsonClass Decorator', () => {
  describe('Basic functionality', () => {
    it('should identify classes decorated with @JsonClass', () => {
      expect(isJsonClass(Product)).toBe(true);
      expect(isJsonClass(TestUser)).toBe(true);
      expect(isJsonClass(User)).toBe(false); // User is not decorated with @JsonClass
    });

    it('should return metadata for decorated classes', () => {
      const productMetadata = getJsonClassMetadata(Product);
      expect(productMetadata).toBeDefined();
      expect(productMetadata?.name).toBe('Product');

      const testUserMetadata = getJsonClassMetadata(TestUser);
      expect(testUserMetadata).toBeDefined();
      expect(testUserMetadata?.name).toBe('User');
    });

    it('should return undefined for non-decorated classes', () => {
      const userMetadata = getJsonClassMetadata(User);
      expect(userMetadata).toBeUndefined();
    });
  });

  describe('Class name functionality', () => {
    it('should return the specified class name', () => {
      expect(getJsonClassName(Product)).toBe('Product');
      expect(getJsonClassName(TestUser)).toBe('User');
    });

    it('should return undefined for non-decorated classes', () => {
      expect(getJsonClassName(User)).toBeUndefined();
    });
  });
});
