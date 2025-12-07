# Basic Usage

Once you have S7E installed, you can start using it to serialize and deserialize your TypeScript classes. This guide covers the fundamental patterns you'll use in everyday development.

## Core Decorators

S7E provides two main decorators to configure your classes:

### @JsonClass Decorator

The `@JsonClass` decorator marks a class as serializable and provides a unique name for type identification:

```typescript
import { JsonClass } from 's7e';

@JsonClass({ name: 'User' })
class User {
  // Class implementation
}
```

### @JsonProperty Decorator

The `@JsonProperty` decorator configures how individual properties are serialized:

```typescript
import { JsonProperty } from 's7e';

@JsonProperty({ name: 'propertyName', type: String })
public property: string;
```

## Basic Serialization

### Simple Class Example

Here's a complete example of a basic class with serialization:

```typescript
import { S7e, JsonClass, JsonProperty } from 's7e';

@JsonClass({ name: 'User' })
class User {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'email', type: String })
  public email: string;

  @JsonProperty({ name: 'active', type: Boolean })
  public active: boolean;

  // Non-serialized properties (no decorator)
  public password: string;
  private internalId: number;

  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.active = true;
    this.password = '';
    this.internalId = Math.random();
  }
}
```

### Serializing Objects

Convert class instances to JSON strings:

```typescript
const user = new User(1, 'John Doe', 'john@example.com');

// Serialize to JSON string
const jsonString = S7e.serialize(user);
console.log(jsonString);
// Output: '{"id":1,"name":"John Doe","email":"john@example.com","active":true}'

// Note: password and internalId are not included (no @JsonProperty decorator)
```

### Deserializing Objects

Convert JSON strings back to class instances:

```typescript
const jsonData = '{"id":2,"name":"Jane Smith","email":"jane@example.com","active":false}';

// Deserialize from JSON string
const user = S7e.deserialize(User, jsonData);

console.log(user instanceof User); // true
console.log(user.name); // "Jane Smith"
console.log(user.id); // 2
console.log(user.active); // false
```

## Working with Arrays

S7E provides convenient methods for working with arrays of objects:

### Serializing Arrays

```typescript
const users = [
  new User(1, 'John Doe', 'john@example.com'),
  new User(2, 'Jane Smith', 'jane@example.com'),
  new User(3, 'Bob Johnson', 'bob@example.com'),
];

// Serialize array to JSON
const jsonArray = S7e.serialize(users);
console.log(jsonArray);
// Output: [{id:1, name:"John Doe", ...}, {id:2, name:"Jane Smith", ...}, ...]
// (To get a JSON string, use JSON.stringify(jsonArray))
```

### Deserializing Arrays

```typescript
const jsonArrayData = `[
  {"id":1,"name":"John Doe","email":"john@example.com","active":true},
  {"id":2,"name":"Jane Smith","email":"jane@example.com","active":false}
]`;

// Deserialize array from JSON
const users = S7e.deserialize(jsonArrayData, [User]);

console.log(Array.isArray(users)); // true
console.log(users.length); // 2
console.log(users[0] instanceof User); // true
console.log(users[1].name); // "Jane Smith"
```

## Property Configuration Options

The `@JsonProperty` decorator accepts various options to customize serialization behavior:

### Basic Type Configuration

```typescript
@JsonClass({ name: 'Product' })
class Product {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'title', type: String })
  public title: string;

  @JsonProperty({ name: 'price', type: Number })
  public price: number;

  @JsonProperty({ name: 'available', type: Boolean })
  public available: boolean;
}
```

### Custom Property Names

Map class properties to different JSON keys:

```typescript
@JsonClass({ name: 'ApiUser' })
class User {
  @JsonProperty({ name: 'user_id', type: Number })
  public id: number;

  @JsonProperty({ name: 'full_name', type: String })
  public name: string;

  @JsonProperty({ name: 'email_address', type: String })
  public email: string;
}

const user = new User();
user.id = 1;
user.name = 'John Doe';
user.email = 'john@example.com';

const json = S7e.serialize(user);
console.log(json);
// Output: '{"user_id":1,"full_name":"John Doe","email_address":"john@example.com"}'
```

## Type Validation

S7E automatically validates types during deserialization:

```typescript
@JsonClass({ name: 'ValidationExample' })
class ValidationExample {
  @JsonProperty({ name: 'number', type: Number })
  public numberValue: number;

  @JsonProperty({ name: 'string', type: String })
  public stringValue: string;
}

// This will work fine
const validJson = '{"number":42,"string":"hello"}';
const valid = S7e.deserialize(ValidationExample, validJson);

// This will throw a type validation error
const invalidJson = '{"number":"not a number","string":"hello"}';
try {
  const invalid = S7e.deserialize(ValidationExample, invalidJson);
} catch (error) {
  console.log('Type validation failed:', error.message);
}
```

## Working with Nested Objects

S7E supports complex nested object structures:

```typescript
@JsonClass({ name: 'Address' })
class Address {
  @JsonProperty({ name: 'street', type: String })
  public street: string;

  @JsonProperty({ name: 'city', type: String })
  public city: string;

  @JsonProperty({ name: 'zipCode', type: String })
  public zipCode: string;
}

@JsonClass({ name: 'Person' })
class Person {
  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'address', type: Address })
  public address: Address;
}

// Create nested object
const address = new Address();
address.street = '123 Main St';
address.city = 'Anytown';
address.zipCode = '12345';

const person = new Person();
person.name = 'John Doe';
person.address = address;

// Serialize nested structure
const json = S7e.serialize(person);
console.log(json);
// Output: '{"name":"John Doe","address":{"street":"123 Main St","city":"Anytown","zipCode":"12345"}}'

// Deserialize nested structure
const deserializedPerson = S7e.deserialize(Person, json);
console.log(deserializedPerson.address instanceof Address); // true
```

## Error Handling

Always wrap deserialization in try-catch blocks for robust error handling:

```typescript
function safeDeserialize<T>(type: new () => T, json: string): T | null {
  try {
    return S7e.deserialize(type, json);
  } catch (error) {
    console.error('Deserialization failed:', error);
    return null;
  }
}

// Usage
const result = safeDeserialize(User, jsonData);
if (result) {
  console.log('Successfully deserialized:', result);
} else {
  console.log('Deserialization failed');
}
```

## Best Practices

### 1. Always Use Type Annotations
```typescript
// Good
@JsonProperty({ name: 'age', type: Number })
public age: number;

// Avoid - missing type specification
@JsonProperty({ name: 'age' })
public age: number;
```

### 2. Consistent Naming
```typescript
// Use consistent naming strategies
@JsonClass({ name: 'UserProfile' })  // PascalCase for class names
class User {
  @JsonProperty({ name: 'user_name', type: String })  // snake_case for API compatibility
  public name: string;
}
```

### 3. Handle Optional Properties
```typescript
@JsonClass({ name: 'OptionalExample' })
class OptionalExample {
  @JsonProperty({ name: 'required', type: String })
  public required: string;

  @JsonProperty({ name: 'optional', type: String, optional: true })
  public optional?: string;
}
```

### 4. Validate Input Data
```typescript
function deserializeUser(jsonData: unknown): User {
  if (typeof jsonData !== 'string') {
    throw new Error('Expected JSON string');
  }

  return S7e.deserialize(User, jsonData);
}
```

## Next Steps

Now that you understand the basics, explore these advanced topics:

- [Advanced Features](/guide/advanced-features) - Optional properties, polymorphism, and more
- [API Reference](/api/decorators) - Complete decorator and method documentation
- [Examples](/examples/basic-usage) - Real-world usage examples

Ready to dive deeper? Check out the [advanced features guide](/guide/advanced-features)!
