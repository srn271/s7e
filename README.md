<div align="center">
  <img src="assets/logo.svg" alt="s7e Logo" width="150" height="150">
</div>

# S7E

> Type-safe JSON serialization for TypeScript classes

[![npm version](https://badge.fury.io/js/s7e.svg)](https://badge.fury.io/js/s7e)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**S7E** is a lightweight TypeScript library that provides seamless serialization and deserialization of TypeScript classes to and from JSON using decorators.

## ✨ Features

- 🎯 **Type-safe** - Full TypeScript support with type validation
- 🚀 **Zero dependencies** - Lightweight and fast
- 🔄 **Polymorphic serialization** - Automatic type discrimination for inheritance
- 📦 **Universal** - Works in Node.js and browsers
- 🛡️ **Optional properties** - Flexible handling of nullable data
- ⚡ **Performance optimized** - Eager metadata loading and caching

## � Quick Start

### Installation

```bash
npm install s7e
```

### Enable Decorators

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Basic Usage

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

  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

// Serialize to object
const user = new User(1, 'John Doe', 'john@example.com');
const obj = S7e.serialize(user);
console.log(obj);
// Output: { $type: "User", id: 1, name: "John Doe", email: "john@example.com" }

// Convert to JSON string if needed
const json = JSON.stringify(obj);

// Deserialize from object or JSON string
const deserializedUser = S7e.deserialize(obj, User);
// or: const deserializedUser = S7e.deserialize(json, User);
console.log(deserializedUser instanceof User); // true
```

## 📚 Documentation

For comprehensive guides, API reference, and examples, visit our **[complete documentation site](https://srn.dev/s7e/)**.

### Quick Links

- 📖 [Getting Started Guide](https://srn.dev/s7e/guide/getting-started)
- ⚙️ [Installation & Setup](https://srn.dev/s7e/guide/installation)
- 🔧 [API Reference](https://srn.dev/s7e/api/decorators)
- 💡 [Examples & Patterns](https://srn.dev/s7e/examples/basic-usage)
- 🏗️ [Advanced Features](https://srn.dev/s7e/guide/advanced-features)

## 💻 Examples

### Polymorphic Serialization

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

// Register types for polymorphic deserialization
S7e.registerTypes([Dog]);

const animals = [new Dog()];
const serializedArray = S7e.serialize(animals);
const deserialized = S7e.deserialize(serializedArray, [Animal]);
console.log(deserialized[0] instanceof Dog); // true
```

### Arrays and Complex Objects

```typescript
@JsonClass({ name: 'Team' })
class Team {
  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'members', type: [User] })
  public members: User[];

  @JsonProperty({ name: 'leader', type: User, optional: true })
  public leader?: User;
}
```

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) and submit pull requests to our [GitHub repository](https://github.com/srn271/s7e).

## 📄 License

MIT © [srn271](https://github.com/srn271)

---

**[📚 View Full Documentation →](https://srn.dev/s7e/)**



### `S7e.serialize<T>(instance: T): Record<string, unknown>`
Serializes a class instance to a plain object (POJO).
- Only properties marked with `@JsonProperty` are included
- Undefined optional properties are automatically skipped
- Returns an object that can be converted to JSON with `JSON.stringify()`

### `S7e.deserialize<T>(json: string | object, cls: Constructor<T>): T`
### `S7e.deserialize(json: string | object, className: string): any`

Deserializes a JSON string or object to a class instance.

**Method 1 - Direct Constructor Reference:**
- Creates a new instance using the provided constructor
- Only sets properties marked with `@JsonProperty`
- Validates types if specified in the decorator
- Throws error if required properties are missing

**Method 2 - String Class Name:**
- Looks up the class constructor using the `@JsonClass` name from the type registry
- Enables dynamic type resolution without importing the class
- Useful for polymorphic deserialization and plugin architectures

**Method 3 - Discriminator-based (no second parameter):**
- Automatically resolves type from `$type` discriminator property in the object
- Requires types to be registered with `S7e.registerTypes()`

## 💡 Best Practices

### When to use @JsonClass

**✅ Recommended:**
```ts
// Always use @JsonClass for classes that will be serialized
@JsonClass({ name: 'User' })
class User {
  @JsonProperty({ name: 'id', type: String })
  id: string;
}

// Use descriptive, unique names
@JsonClass({ name: 'ShoppingCartItem' })
class CartItem { /* ... */ }

// Consider future polymorphism when naming
@JsonClass({ name: 'EmailNotification' })
class EmailNotification extends Notification { /* ... */ }
```

**⚠️ Naming Guidelines:**
- Use **PascalCase** for consistency: `'UserProfile'`, `'ProductOrder'`
- Make names **unique** across your entire application
- Use **descriptive names** that clearly identify the class purpose
- Consider **inheritance hierarchies** when naming (e.g., `'BaseShape'`, `'Circle'`, `'Rectangle'`)
- Avoid **generic names** like `'Data'`, `'Object'`, `'Item'` unless very specific

**🔮 Future-Proofing:**
```ts
// Prepare for discriminator patterns
@JsonClass({ name: 'BaseEntity' })
abstract class BaseEntity {
  @JsonProperty({ name: 'id', type: String })
  id: string;

  // No explicit discriminator property needed
  // S7e will automatically add '$type' during serialization
}

@JsonClass({ name: 'UserEntity' })
class User extends BaseEntity {
  @JsonProperty({ name: 'name', type: String })
  name: string;
}

// Optional: Configure custom discriminator property name
// S7e.setDiscriminatorProperty('entityType'); // defaults to '$type'
```

## 🧪 Testing

```sh
npm test
```

## 🏗️ Build

```sh
npm run build
```

## 🗺️ Roadmap

### Upcoming Features

**⚡ String-Based Type References for Properties**
- Property type declarations using strings: `@JsonProperty({ name: 'user', type: 'User' })`
- On-demand resolution of property types through type registry
- Circular reference support via string type references in property declarations
- Memory optimization for large object graphs with lazy property type resolution

**🔧 Advanced Features**
- Circular reference handling
- Custom serialization hooks
- Schema validation integration
- Performance optimizations

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT

---

> Made with ❤️ by srn
