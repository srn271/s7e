# S7e Class

The `S7e` class provides static methods for serializing and deserializing TypeScript objects to and from JSON. This is the main API you'll use for all serialization operations.

## Static Methods

### serialize()

Converts a class instance to a JSON string.

#### Syntax

```typescript
S7e.serialize<T>(instance: T): string
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `instance` | `T` | The class instance to serialize |

#### Returns

`string` - JSON string representation of the instance

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

const json = S7e.serialize(user);
console.log(json);
// Output: '{"$type":"User","id":1,"name":"John Doe"}'
```

---

### serializeToObject()

Converts a class instance to a plain JavaScript object (POJO).

#### Syntax

```typescript
S7e.serializeToObject<T>(instance: T): Record<string, unknown> | null | undefined
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `instance` | `T` | The class instance to serialize |

#### Returns

`Record<string, unknown> | null | undefined` - Plain object representation

#### Example

```typescript
const user = new User();
user.id = 1;
user.name = 'John Doe';

const obj = S7e.serializeToObject(user);
console.log(obj);
// Output: { $type: 'User', id: 1, name: 'John Doe' }
```

---

### serializeArray()

Converts an array of class instances to a JSON string.

#### Syntax

```typescript
S7e.serializeArray<T>(instances: T[]): string
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `instances` | `T[]` | Array of class instances to serialize |

#### Returns

`string` - JSON string representation of the array

#### Example

```typescript
const users = [
  new User(1, 'John Doe'),
  new User(2, 'Jane Smith'),
  new User(3, 'Bob Johnson')
];

const jsonArray = S7e.serializeArray(users);
console.log(jsonArray);
// Output: '[{"$type":"User","id":1,"name":"John Doe"},{"$type":"User","id":2,"name":"Jane Smith"},{"$type":"User","id":3,"name":"Bob Johnson"}]'
```

---

### deserialize()

Converts a JSON string to a class instance.

#### Syntax

```typescript
S7e.deserialize<T>(type: ClassConstructor<T>, json: string): T
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `ClassConstructor<T>` | The class constructor to deserialize to |
| `json` | `string` | JSON string to deserialize |

#### Returns

`T` - Instance of the specified class

#### Throws

- `Error` - If JSON is invalid or type validation fails
- `TypeError` - If required properties are missing or have wrong types

#### Example

```typescript
const jsonString = '{"id":1,"name":"John Doe"}';
const user = S7e.deserialize(User, jsonString);

console.log(user instanceof User); // true
console.log(user.id); // 1
console.log(user.name); // "John Doe"
```

---

### deserializeArray()

Converts a JSON string to an array of class instances.

#### Syntax

```typescript
S7e.deserializeArray<T>(type: ClassConstructor<T>, json: string): T[]
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `ClassConstructor<T>` | The class constructor for array elements |
| `json` | `string` | JSON string representing an array |

#### Returns

`T[]` - Array of instances of the specified class

#### Example

```typescript
const jsonArrayString = '[{"id":1,"name":"John"},{"id":2,"name":"Jane"}]';
const users = S7e.deserializeArray(User, jsonArrayString);

console.log(Array.isArray(users)); // true
console.log(users.length); // 2
console.log(users[0] instanceof User); // true
console.log(users[1].name); // "Jane"
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
