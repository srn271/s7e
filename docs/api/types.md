# Types

S7E provides a comprehensive type system to ensure type safety and enable powerful serialization features. This reference covers all the types, interfaces, and type definitions used throughout the library.

## Core Types

### ClassConstructor&lt;T&gt;

A type representing a class constructor that can create instances of type `T`.

#### Definition

```typescript
type ClassConstructor<T = any> =
  | (new (...args: any[]) => T)
  | (abstract new (...args: any[]) => T);
```

#### Usage

```typescript
function deserialize<T>(type: ClassConstructor<T>, json: string): T {
  // Implementation
}

// Examples
class User { }
abstract class Shape { }

const UserConstructor: ClassConstructor<User> = User;
const ShapeConstructor: ClassConstructor<Shape> = Shape;
```

---

### TypeConstructor

A union type representing all valid type constructors for JSON properties.

#### Definition

```typescript
type TypeConstructor =
  | PrimitiveConstructor
  | ClassConstructor;
```

#### Primitive Types

```typescript
type PrimitiveConstructor =
  | StringConstructor    // String
  | NumberConstructor    // Number
  | BooleanConstructor   // Boolean
  | DateConstructor;     // Date
```

#### Usage

```typescript
// Primitive types
@JsonProperty({ name: 'text', type: String })
public text: string;

@JsonProperty({ name: 'count', type: Number })
public count: number;

@JsonProperty({ name: 'active', type: Boolean })
public active: boolean;

@JsonProperty({ name: 'created', type: Date })
public created: Date;

// Custom class types
@JsonProperty({ name: 'user', type: User })
public user: User;

// Array types
@JsonProperty({ name: 'tags', type: [String] })
public tags: string[];

@JsonProperty({ name: 'users', type: [User] })
public users: User[];
```

---

### ConverterContext

Context information passed to converter methods during serialization and deserialization.

#### Definition

```typescript
interface ConverterContext {
  parent: object;
  propertyName: string;
}
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `parent` | `object` | The parent object containing the property being converted. Always provided for both single values and array elements. |
| `propertyName` | `string` | The name of the property being converted (JSON name). Always provided for both single values and array elements. |

#### Usage

Context is always provided to converters and allows them to access the parent object and make decisions based on other properties:

```typescript
const contextAwareConverter: Converter<number, string> = {
  serialize: (value: number, context: ConverterContext) => {
    // parent and propertyName are always available
    const parent = context.parent as any;
    if (parent.formatAsPercentage) {
      return `${(value * 100).toFixed(0)}%`;
    }
    return value.toString();
  },
  deserialize: (value: string, context: ConverterContext) => {
    return value.endsWith('%') 
      ? parseFloat(value.replace('%', '')) / 100
      : parseFloat(value);
  }
};
```

---

### Converter&lt;T, S&gt;

Interface for custom property converters that handle serialization and deserialization of specific types.

#### Definition

```typescript
interface Converter<T = any, S = any> {
  serialize: (value: T, context: ConverterContext) => S;
  deserialize: (value: S, context: ConverterContext) => T;
}
```

#### Type Parameters

| Parameter | Description |
|-----------|-------------|
| `T` | The TypeScript type of the property |
| `S` | The serialized type (usually string, number, or plain object) |

#### Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `serialize` | `value: T, context: ConverterContext` | `S` | Converts a TypeScript value to its serialized representation |
| `deserialize` | `value: S, context: ConverterContext` | `T` | Converts a serialized value back to its TypeScript representation |

#### Usage

```typescript
// Simple Date converter (context parameter required but not used)
const dateConverter: Converter<Date, string> = {
  serialize: (value: Date, context: ConverterContext) => value.toISOString(),
  deserialize: (value: string, context: ConverterContext) => new Date(value)
};

// Luxon DateTime converter (context parameter required but not used)
import { DateTime } from 'luxon';

const dateTimeConverter: Converter<DateTime, string> = {
  serialize: (value: DateTime, context: ConverterContext) => value.toISO(),
  deserialize: (value: string, context: ConverterContext) => DateTime.fromISO(value)
};

// Context-aware converter
const conditionalConverter: Converter<number, string> = {
  serialize: (value: number, context: ConverterContext) => {
    // Access parent to make conversion decisions
    const parent = context.parent as any;
    if (parent?.usePercentage) {
      return `${value * 100}%`;
    }
    return value.toString();
  },
  deserialize: (value: string, context: ConverterContext) => {
    return value.endsWith('%')
      ? parseFloat(value) / 100
      : parseFloat(value);
  }
};

// Use with @JsonProperty
class Event {
  @JsonProperty({ name: 'scheduledAt', converter: dateTimeConverter })
  public scheduledAt: DateTime;
  
  @JsonProperty({ name: 'progress', converter: conditionalConverter })
  public progress: number;
}
```

See [Custom Converters](/examples/custom-converters) for more examples and best practices.

---

### PropertyMapping

Internal type used to map class property names to JSON property names.

#### Definition

```typescript
interface PropertyMapping {
  /** The TypeScript property name */
  name: string;

  /** The JSON property name */
  jsonName: string;
}
```

#### Usage

This type is used internally by the metadata registry. You typically don't interact with it directly, but it's created when you use the `@JsonProperty` decorator:

```typescript
@JsonProperty({ name: 'user_name', type: String })
public userName: string;
// Creates: { name: 'userName', jsonName: 'user_name' }
```

## Configuration Interfaces

### JsonClassOptions

Configuration options for the `@JsonClass` decorator.

#### Definition

```typescript
interface JsonClassOptions {
  /** Name for the JSON class (mandatory) */
  name: string;
}
```

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Unique identifier for the class used in polymorphic serialization |

#### Usage

```typescript
@JsonClass({ name: 'User' })
class User {
  // Implementation
}

@JsonClass({ name: 'AdminUser' })
class AdminUser extends User {
  // Implementation
}
```

#### Guidelines

- **Unique Names**: Each class should have a unique name across your application
- **Descriptive**: Use clear, descriptive names that identify the class purpose
- **Consistent**: Follow a consistent naming convention (e.g., PascalCase)
- **Stable**: Avoid changing names after deployment as it affects serialized data compatibility

```typescript
// Good examples
@JsonClass({ name: 'UserProfile' })
@JsonClass({ name: 'ShoppingCart' })
@JsonClass({ name: 'PaymentMethod' })
@JsonClass({ name: 'OrderItem' })

// Avoid
@JsonClass({ name: 'data' })
@JsonClass({ name: 'obj' })
@JsonClass({ name: 'temp' })
```

---

### JsonPropertyOptions

Configuration options for the `@JsonProperty` decorator.

#### Definition

```typescript
interface JsonPropertyOptions {
  /** The JSON property name (mandatory) */
  name: string;

  /** The type constructor or array of type constructors */
  type?: TypeConstructor | [TypeConstructor];

  /** Whether the property is optional (default: false) */
  optional?: boolean;

  /** Custom converter for serialization/deserialization */
  converter?: Converter;
}
```

#### Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | `string` | Yes | - | JSON property name for serialization |
| `type` | `TypeConstructor \| [TypeConstructor]` | No | Inferred | Type constructor for validation and deserialization |
| `optional` | `boolean` | No | `false` | Whether the property can be omitted from JSON |
| `converter` | `Converter` | No | - | Custom converter for third-party types (e.g., DateTime) |

#### Usage Examples

##### Basic Properties

```typescript
@JsonProperty({ name: 'userId', type: Number })
public id: number;

@JsonProperty({ name: 'userName', type: String })
public name: string;

@JsonProperty({ name: 'isActive', type: Boolean })
public active: boolean;
```

##### Optional Properties

```typescript
@JsonProperty({ name: 'email', type: String, optional: true })
public email?: string;

@JsonProperty({ name: 'phone', type: String, optional: true })
public phoneNumber?: string;
```

##### Array Properties

```typescript
@JsonProperty({ name: 'tags', type: [String] })
public tags: string[];

@JsonProperty({ name: 'scores', type: [Number] })
public scores: number[];

@JsonProperty({ name: 'addresses', type: [Address] })
public addresses: Address[];
```

##### Custom Object Properties

```typescript
@JsonProperty({ name: 'profile', type: UserProfile })
public profile: UserProfile;

@JsonProperty({ name: 'settings', type: UserSettings, optional: true })
public settings?: UserSettings;
```

##### Properties with Custom Converters

```typescript
// Define a converter
const dateTimeConverter: Converter<DateTime, string> = {
  serialize: (value: DateTime, context: ConverterContext) => value.toISO(),
  deserialize: (value: string, context: ConverterContext) => DateTime.fromISO(value)
};

@JsonProperty({ name: 'createdAt', converter: dateTimeConverter })
public createdAt: DateTime;

@JsonProperty({ name: 'scheduledDates', converter: dateTimeConverter })
public scheduledDates: DateTime[];
```

## Type Validation

S7E performs runtime type validation during deserialization to ensure data integrity.

### Validation Rules

#### Primitive Types

```typescript
// String validation
@JsonProperty({ name: 'text', type: String })
public text: string;
// Accepts: "hello", "123", ""
// Rejects: 123, true, null, undefined, {}

// Number validation
@JsonProperty({ name: 'count', type: Number })
public count: number;
// Accepts: 42, 3.14, 0, -10
// Rejects: "123", true, null, undefined, {}

// Boolean validation
@JsonProperty({ name: 'active', type: Boolean })
public active: boolean;
// Accepts: true, false
// Rejects: "true", 1, 0, null, undefined, {}

// Date validation
@JsonProperty({ name: 'created', type: Date })
public created: Date;
// Accepts: "2025-01-29T00:00:00Z", "2025-01-29"
// Rejects: "invalid date", 123, true, null, undefined
```

#### Array Validation

```typescript
@JsonProperty({ name: 'tags', type: [String] })
public tags: string[];
// Accepts: ["tag1", "tag2"], []
// Rejects: "not an array", [1, 2, 3], [true, false]

@JsonProperty({ name: 'users', type: [User] })
public users: User[];
// Validates each array element as User instance
```

#### Optional Property Validation

```typescript
@JsonProperty({ name: 'optional', type: String, optional: true })
public optional?: string;
// Accepts: "value", undefined (missing from JSON)
// Rejects: null, 123, true (if present, must be valid type)
```

### Custom Type Validation

For complex validation scenarios, implement validation in static factory methods:

```typescript
@JsonClass({ name: 'ValidatedUser' })
class ValidatedUser {
  @JsonProperty({ name: 'email', type: String })
  public email: string;

  @JsonProperty({ name: 'age', type: Number })
  public age: number;

  public static fromJson(json: string): ValidatedUser {
    const user = S7e.deserialize(ValidatedUser, json);

    // Custom validation
    if (!user.email.includes('@')) {
      throw new Error('Invalid email format');
    }

    if (user.age < 0 || user.age > 150) {
      throw new Error('Age must be between 0 and 150');
    }

    return user;
  }
}
```

## Type Guards and Utility Types

### Type Guards

S7E doesn't export type guards directly, but you can create your own:

```typescript
function isUser(obj: any): obj is User {
  return obj instanceof User &&
         typeof obj.id === 'number' &&
         typeof obj.name === 'string';
}

function isUserArray(obj: any): obj is User[] {
  return Array.isArray(obj) && obj.every(isUser);
}

// Usage
const data = S7e.deserialize(User, jsonString);
if (isUser(data)) {
  // TypeScript knows data is User
  console.log(data.name);
}
```

### Utility Types

#### DeserializationResult

Create a utility type for safe deserialization:

```typescript
type DeserializationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function safeDeserialize<T>(
  type: ClassConstructor<T>,
  json: string
): DeserializationResult<T> {
  try {
    const data = S7e.deserialize(type, json);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

#### SerializableClass

Define a type for classes that can be serialized:

```typescript
type SerializableClass<T = any> = ClassConstructor<T> & {
  prototype: T;
};

function isSerializable<T>(type: ClassConstructor<T>): type is SerializableClass<T> {
  // Check if class has @JsonClass decorator
  return MetadataRegistry.isJsonClass(type);
}
```

## TypeScript Configuration

For optimal type safety with S7E, configure your TypeScript project correctly:

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "useDefineForClassFields": false
  }
}
```

### Key Options for S7E

- `experimentalDecorators: true` - Required for decorator support
- `emitDecoratorMetadata: true` - Required for metadata emission
- `strict: true` - Enables all strict type checking
- `exactOptionalPropertyTypes: true` - Ensures proper optional property handling
- `useDefineForClassFields: false` - Maintains compatibility with decorators

## Advanced Type Patterns

### Generic Serializable Classes

```typescript
@JsonClass({ name: 'Result' })
class Result<T> {
  @JsonProperty({ name: 'success', type: Boolean })
  public success: boolean;

  @JsonProperty({ name: 'data', type: Object, optional: true })
  public data?: T;

  @JsonProperty({ name: 'error', type: String, optional: true })
  public error?: string;

  public static success<T>(data: T): Result<T> {
    const result = new Result<T>();
    result.success = true;
    result.data = data;
    return result;
  }

  public static error<T>(error: string): Result<T> {
    const result = new Result<T>();
    result.success = false;
    result.error = error;
    return result;
  }
}
```

### Conditional Types

```typescript
type SerializedType<T> = T extends string
  ? string
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : T extends Date
  ? string
  : T extends Array<infer U>
  ? SerializedType<U>[]
  : T extends object
  ? Record<string, unknown>
  : never;

// Example usage
type SerializedUser = SerializedType<User>;
// Results in an object type with serialized property types
```

### Mapped Types

```typescript
type JsonPropertyNames<T> = {
  [K in keyof T]: T[K] extends { name: string } ? T[K]['name'] : never;
}[keyof T];

// Extract JSON property names from a class
type UserJsonProperties = JsonPropertyNames<User>;
```

## Type Compatibility

### Backward Compatibility

S7E maintains type compatibility across versions:

```typescript
// Version 1.0
@JsonClass({ name: 'User' })
class User {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;
}

// Version 1.1 - Adding optional property (backward compatible)
@JsonClass({ name: 'User' })
class User {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'email', type: String, optional: true })
  public email?: string;
}
```

### Forward Compatibility

Design classes for forward compatibility:

```typescript
@JsonClass({ name: 'ExtensibleUser' })
class ExtensibleUser {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'name', type: String })
  public name: string;

  // Reserved for future use
  @JsonProperty({ name: 'metadata', type: Object, optional: true })
  public metadata?: Record<string, unknown>;
}
```

## Related APIs

- [Decorators](/api/decorators) - Using types with @JsonClass and @JsonProperty
- [S7e Class](/api/s7e-class) - Methods that use these types
- [Advanced Features](/guide/advanced-features) - Complex type scenarios
