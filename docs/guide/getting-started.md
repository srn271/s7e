# Getting Started

Welcome to **S7E**, a powerful TypeScript library for JSON serialization and deserialization that puts type safety first.

## What is S7E?

S7E (Serialize/Deserialize) is a decorator-based TypeScript library that allows you to easily convert TypeScript class instances to JSON and back while maintaining type safety and validation. It's designed to be lightweight, fast, and developer-friendly.

## Key Features

- **🎯 Type-Safe**: Automatic type validation during deserialization
- **⚡ Zero Dependencies**: No external dependencies for core functionality
- **🔧 Decorator-Based**: Clean API using TypeScript decorators
- **🌐 Universal**: Works in Node.js and browsers
- **🚀 High Performance**: Optimized for production use
- **🎨 Flexible**: Support for complex objects, arrays, and optional properties

## Quick Example

Here's a simple example to get you started:

```typescript
import { S7e, JsonProperty, JsonClass } from 's7e';

@JsonClass({ name: 'User' })
class User {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'email', type: String })
  public email: string;

  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

// Create a user instance
const user = new User(1, 'John Doe', 'john@example.com');

// Serialize to JSON
const json = S7e.serialize(user);
console.log(json);
// Output: {"id":1,"name":"John Doe","email":"john@example.com"}

// Deserialize from JSON
const jsonString = '{"id":2,"name":"Jane Smith","email":"jane@example.com"}';
const deserializedUser = S7e.deserialize(User, jsonString);
console.log(deserializedUser instanceof User); // true
```

## Why Choose S7E?

### Type Safety
Unlike JSON.parse(), S7E validates types during deserialization, catching runtime errors before they affect your application.

### Developer Experience
The decorator-based API is intuitive and integrates seamlessly with TypeScript's type system.

### Performance
Metadata is eagerly loaded for fast property access, making S7E suitable for high-performance applications.

### Flexibility
Support for complex scenarios including:
- Nested objects
- Arrays of objects
- Optional properties
- Custom property naming
- Polymorphic serialization

## Next Steps

1. [Install S7E](/guide/installation) in your project
2. Learn the [basic usage patterns](/guide/basic-usage)
3. Explore [advanced features](/guide/advanced-features)
4. Check out practical [examples](/examples/basic-usage)

Ready to get started? Let's [install S7E](/guide/installation) and begin using it in your project!
