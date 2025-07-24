import { describe, expect, test } from 'vitest';
import { MetadataRegistry } from '../core/metadata-registry';
import { Product, TestUser } from './json-class.fixture';
import { User } from './user.fixture';

describe('JsonClass Decorator', () => {
  describe('Basic functionality', () => {
    test('should identify classes decorated with @JsonClass', () => {
      expect(MetadataRegistry.isJsonClass(Product)).toBe(true);
      expect(MetadataRegistry.isJsonClass(TestUser)).toBe(true);
      expect(MetadataRegistry.isJsonClass(User)).toBe(false); // User is not decorated with @JsonClass
    });

    test('should return metadata for decorated classes', () => {
      const productMetadata = MetadataRegistry.getClassMetadata(Product);
      expect(productMetadata).toBeDefined();
      expect(productMetadata?.name).toBe('Product');

      const testUserMetadata = MetadataRegistry.getClassMetadata(TestUser);
      expect(testUserMetadata).toBeDefined();
      expect(testUserMetadata?.name).toBe('User');
    });

    test('should return undefined for non-decorated classes', () => {
      const userMetadata = MetadataRegistry.getClassMetadata(User);
      expect(userMetadata).toBeUndefined();
    });
  });

  describe('Class name functionality', () => {
    test('should return the specified class name', () => {
      expect(MetadataRegistry.getClassName(Product)).toBe('Product');
      expect(MetadataRegistry.getClassName(TestUser)).toBe('User');
    });

    test('should return undefined for non-decorated classes', () => {
      expect(MetadataRegistry.getClassName(User)).toBeUndefined();
    });
  });
});
