# S7e Class

The `S7e` class provides static methods for serializing and deserializing TypeScript objects to and from JSON. This is the main API you'll use for all serialization operations.

## Static Methods

### serialize()

Converts a class instance or array of instances to a plain object (POJO) or array of objects.

#### Syntax

```typescript
// Single instance
S7e.serialize<T>(instance: T): Record<string, unknown> | null | undefined
S7e.serialize<T>(instance: T, cls: ClassConstructor<T>): Record<string, unknown> | null | undefined

// Array of instances
S7e.serialize<T>(instances: T[]): Record<string, unknown>[]
S7e.serialize<T>(instances: T[], cls: ClassConstructor<T>): Record<string, unknown>[]
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `instance` | `T \| null \| undefined` | The class instance to serialize |
| `instances` | `T[]` | Array of class instances to serialize |
| `cls` | `ClassConstructor<T>` | Optional. Explicit class constructor to use for serialization |

#### Returns

- `Record<string, unknown> | null | undefined` - For single instances
- `Record<string, unknown>[]` - For arrays

#### Example

```typescript
@JsonClass({ name: 'User' })
class User {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'name', type: String })
  public name: string;
}

const user = new User();
user.id = 1;
user.name = 'John Doe';

const obj = S7e.serialize(user);
console.log(obj);
// Output: { $type: "User", id: 1, name: "John Doe" }

// Convert to JSON string if needed
const json = JSON.stringify(obj);

// Example with explicit class parameter
const baseObj = S7e.serialize(user, BaseUser);
// Uses BaseUser's properties and discriminator instead of User's

// Array serialization
const users = [user1, user2, user3];
const userArray = S7e.serialize(users);
console.log(userArray);
// Output: [{ $type: "User", id: 1, name: "John" }, { $type: "User", id: 2, name: "Jane" }, ...]

// Array with explicit class parameter
const baseArray = S7e.serialize(users, BaseUser);
// All items serialized using BaseUser schema
```



---

### deserialize()

Converts a JSON string or object to a class instance.

#### Syntax

```typescript
// From JSON string or object with explicit class constructor
S7e.deserialize<T>(json: string | Record<string, unknown>, cls: ClassConstructor<T>): T

// From JSON string or object with class name
S7e.deserialize(json: string | Record<string, unknown>, className: string): object

// From array with polymorphic type resolution
S7e.deserialize<T>(json: string | Record<string, unknown>[], cls: [ClassConstructor<T>]): T[]

// From discriminator only (automatic type resolution)
S7e.deserialize(json: string | Record<string, unknown>): object
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `json` | `string \| Record<string, unknown> \| Record<string, unknown>[]` | JSON string, object, or array to deserialize |
| `cls` | `ClassConstructor<T> \| string \| [ClassConstructor<T>]` | Class constructor, class name, or array wrapper for polymorphic deserialization |

#### Returns

`T | object | T[]` - Instance(s) of the specified class(es)

#### Throws

- `Error` - If JSON is invalid, type validation fails, or class is not registered
- `TypeError` - If required properties are missing or have wrong types

#### Examples

```typescript
// From JSON string
const jsonString = '{"$type":"User","id":1,"name":"John Doe"}';
const user1 = S7e.deserialize(jsonString, User);

// From object
const obj = { $type: "User", id: 1, name: "John Doe" };
const user2 = S7e.deserialize(obj, User);

// Using class name (requires registration)
S7e.registerTypes([User]);
const user3 = S7e.deserialize(jsonString, 'User');

// Automatic type resolution from discriminator
const user4 = S7e.deserialize(jsonString); // Uses $type property

// Polymorphic array deserialization
const arrayJson = '[{"$type":"User","id":1},{"$type":"Admin","id":2}]';
const users = S7e.deserialize(arrayJson, [User]); // Returns mixed User/Admin instances

console.log(user2 instanceof User); // true
console.log(user2.id); // 1
console.log(user2.name); // "John Doe"
```

## Polymorphic Serialization Methods

### registerTypes()

Registers multiple types for polymorphic deserialization.

#### Syntax

```typescript
S7e.registerTypes(types: ClassConstructor[]): void
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `types` | `ClassConstructor[]` | Array of class constructors to register |

#### Example

```typescript
@JsonClass({ name: 'Animal' })
abstract class Animal {
  @JsonProperty({ name: 'name', type: String })
  public name: string;
}

@JsonClass({ name: 'Dog' })
class Dog extends Animal {
  @JsonProperty({ name: 'breed', type: String })
  public breed: string;
}

@JsonClass({ name: 'Cat' })
class Cat extends Animal {
  @JsonProperty({ name: 'indoor', type: Boolean })
  public indoor: boolean;
}

// Register types for polymorphic deserialization
S7e.registerTypes([Dog, Cat]);

// Now you can deserialize polymorphic arrays
const animalsJson = '[{"$type":"Dog","name":"Buddy","breed":"Golden Retriever"},{"$type":"Cat","name":"Whiskers","indoor":true}]';
const animals = S7e.deserializeArray(Animal, animalsJson);
console.log(animals[0] instanceof Dog); // true
console.log(animals[1] instanceof Cat); // true
```

---

### registerType()

Registers a single type for polymorphic deserialization.

#### Syntax

```typescript
S7e.registerType(name: string, type: ClassConstructor): void
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | The name to register the type under |
| `type` | `ClassConstructor` | The class constructor to register |

#### Example

```typescript
// Register individual types
S7e.registerType('Dog', Dog);
S7e.registerType('Cat', Cat);
```

---

### getRegisteredType()

Retrieves a registered type by name.

#### Syntax

```typescript
S7e.getRegisteredType(name: string): ClassConstructor | undefined
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | The name of the registered type |

#### Returns

`ClassConstructor | undefined` - The class constructor or undefined if not found

#### Example

```typescript
const DogClass = S7e.getRegisteredType('Dog');
if (DogClass) {
  const dog = new DogClass();
}
```

---

### clearTypeRegistry()

Clears all registered types from the type registry.

#### Syntax

```typescript
S7e.clearTypeRegistry(): void
```

#### Example

```typescript
// Clear all registered types
S7e.clearTypeRegistry();

// Re-register types as needed
S7e.registerTypes([Dog, Cat, Bird]);
```

## Discriminator Configuration

### setDiscriminatorProperty()

Sets the property name used for type discrimination in polymorphic serialization.

#### Syntax

```typescript
S7e.setDiscriminatorProperty(propertyName: string): void
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `propertyName` | `string` | Name of the discriminator property (default: '$type') |

#### Example

```typescript
// Use custom discriminator property
S7e.setDiscriminatorProperty('__type');

const dog = new Dog();
const json = S7e.serialize(dog);
console.log(json);
// Output: '{"__type":"Dog","name":"Buddy","breed":"Golden Retriever"}'

// Reset to default
S7e.setDiscriminatorProperty('$type');
```

## Error Handling

All S7e methods can throw errors in various scenarios. Always wrap calls in try-catch blocks for robust error handling:

### Common Error Scenarios

```typescript
// Invalid JSON
try {
  const user = S7e.deserialize(User, 'invalid json');
} catch (error) {
  console.error('JSON parsing failed:', error.message);
}

// Type validation failure
try {
  const user = S7e.deserialize(User, '{"id":"not a number","name":"John"}');
} catch (error) {
  console.error('Type validation failed:', error.message);
}

// Missing required properties
try {
  const user = S7e.deserialize(User, '{"name":"John"}'); // missing required 'id'
} catch (error) {
  console.error('Missing required property:', error.message);
}

// Unregistered polymorphic type
try {
  S7e.clearTypeRegistry(); // Clear all registered types
  const animals = S7e.deserializeArray(Animal, '[{"$type":"Dog","name":"Buddy"}]');
} catch (error) {
  console.error('Unregistered type:', error.message);
}
```

### Recommended Error Handling Pattern

```typescript
function safeDeserialize<T>(
  type: ClassConstructor<T>,
  json: string
): { success: true; data: T } | { success: false; error: string } {
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

// Usage
const result = safeDeserialize(User, jsonString);
if (result.success) {
  console.log('User:', result.data);
} else {
  console.error('Failed to deserialize user:', result.error);
}
```

## Performance Considerations

### Batch Operations

For large datasets, S7e is optimized for batch operations:

```typescript
// Efficient for large arrays
const largeUserArray = new Array(10000).fill(null).map((_, i) =>
  new User(i, `User${i}`)
);

// Single operation for entire array
const jsonArray = S7e.serializeArray(largeUserArray);
const deserializedArray = S7e.deserializeArray(User, jsonArray);
```

### Metadata Caching

S7e uses eager metadata loading and caching for optimal performance:

```typescript
// Metadata is loaded once when decorators are applied
@JsonClass({ name: 'CachedClass' })
class CachedClass {
  @JsonProperty({ name: 'data', type: String })
  public data: string;
}

// No metadata loading overhead in these operations
const instance = new CachedClass();
const json = S7e.serialize(instance);      // Fast
const restored = S7e.deserialize(CachedClass, json); // Fast
```

### Memory Usage

S7e minimizes memory usage by:
- Not storing unnecessary metadata
- Efficient object creation during deserialization
- Reusing metadata across instances

## Integration Examples

### With HTTP APIs

```typescript
class ApiClient {
  async getUser(id: number): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    const json = await response.text();
    return S7e.deserialize(User, json);
  }

  async getUsers(): Promise<User[]> {
    const response = await fetch('/api/users');
    const json = await response.text();
    return S7e.deserializeArray(User, json);
  }

  async createUser(user: User): Promise<User> {
    const json = S7e.serialize(user);
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json
    });
    const responseJson = await response.text();
    return S7e.deserialize(User, responseJson);
  }
}
```

### With Local Storage

```typescript
class UserStorage {
  private static readonly STORAGE_KEY = 'current_user';

  static saveUser(user: User): void {
    const json = S7e.serialize(user);
    localStorage.setItem(this.STORAGE_KEY, json);
  }

  static loadUser(): User | null {
    const json = localStorage.getItem(this.STORAGE_KEY);
    if (!json) return null;

    try {
      return S7e.deserialize(User, json);
    } catch (error) {
      console.error('Failed to deserialize user from storage:', error);
      return null;
    }
  }

  static clearUser(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
```

## Related APIs

- [Decorators](/api/decorators) - @JsonClass and @JsonProperty configuration
- [Types](/api/types) - Complete type definitions
- [Advanced Features](/guide/advanced-features) - Complex scenarios and best practices
