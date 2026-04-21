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
- 🔧 **Custom converters** - Per-property serialization hooks for third-party types

## 🚀 Quick Start

### Installation

```bash
npm install s7e
```

### TypeScript requirement

S7E uses [TC39 standard decorators](https://github.com/tc39/proposal-decorators) (TypeScript 5.0+). No legacy flags are needed — do **not** add `experimentalDecorators` or `emitDecoratorMetadata` to your `tsconfig.json`. A minimal config:

```json
{
  "compilerOptions": {
    "target": "es2022"
  }
}
```

### Basic Usage

```typescript
import { S7e, JsonClass, JsonProperty } from 's7e';

@JsonClass({ name: 'User' })
class User {
  @JsonProperty({ name: 'id', type: Number })
  public id: number = 0;

  @JsonProperty({ name: 'name', type: String })
  public name: string = '';

  @JsonProperty({ name: 'email', type: String })
  public email: string = '';
}

// Serialize to object
const user = new User();
user.id = 1;
user.name = 'John Doe';
user.email = 'john@example.com';

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

> **Note:** Classes used with `S7e.deserialize` must be instantiable with no arguments (`new MyClass()`). Use property initializers or default parameter values rather than required constructor parameters.

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
  public name: string = '';
}

@JsonClass({ name: 'Dog' })
class Dog extends Animal {
  @JsonProperty({ name: 'breed', type: String })
  public breed: string = '';
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
  public name: string = '';

  @JsonProperty({ name: 'members', type: [User] })
  public members: User[] = [];

  @JsonProperty({ name: 'leader', type: User, optional: true })
  public leader?: User;
}
```

### Custom Converters

Use `converter` on any `@JsonProperty` to handle types that don't map directly to JSON primitives (e.g. `Date`, Luxon `DateTime`, `BigInt`):

```typescript
import type { Converter } from 's7e';

const dateConverter: Converter<Date, string> = {
  serialize: (value) => value.toISOString(),
  deserialize: (value) => new Date(value),
};

@JsonClass({ name: 'Event' })
class Event {
  @JsonProperty({ name: 'title', type: String })
  public title: string = '';

  @JsonProperty({ name: 'date', converter: dateConverter })
  public date: Date = new Date();
}

const event = new Event();
event.title = 'Conference';
event.date = new Date('2024-06-15T12:00:00.000Z');

const obj = S7e.serialize(event);
// { $type: "Event", title: "Conference", date: "2024-06-15T12:00:00.000Z" }

const restored = S7e.deserialize(obj, Event);
console.log(restored.date instanceof Date); // true
```

Converters also work on array properties — the converter is applied to each element individually.

## 🔌 API Reference

### Decorators

#### `@JsonClass({ name: string })`

Marks a class for serialization. The `name` is used as the discriminator value (written to `$type` by default).

#### `@JsonProperty(options)`

Marks a class property for serialization.

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `name` | `string` | ✅ | JSON key name |
| `type` | `Constructor \| [Constructor]` | — | Type for deserialization. Wrap in `[]` for arrays. If omitted, runtime inference is used. |
| `optional` | `boolean` | — | Skip on serialize if `undefined`; don't throw if missing on deserialize |
| `converter` | `Converter<T, S>` | — | Custom serialize/deserialize pair; takes precedence over `type` |

### `S7e` static methods

#### `S7e.serialize(instance)`

Serializes a class instance to a plain object. Automatically adds the `$type` discriminator. Undefined optional properties are skipped.

**Overloads:**

```typescript
// Single instance
S7e.serialize<T>(instance: T): Record<string, unknown>
S7e.serialize<T>(instance: T | null | undefined): Record<string, unknown> | null | undefined

// Single instance with explicit class (serialize using a specific class's property schema)
S7e.serialize<T>(instance: T, cls: ClassConstructor<T>): Record<string, unknown>

// Array of instances
S7e.serialize<T>(instances: T[]): Record<string, unknown>[]

// Array with explicit class
S7e.serialize<T>(instances: T[], cls: ClassConstructor<T>): Record<string, unknown>[]
```

#### `S7e.deserialize(json, target?)`

Deserializes a JSON string or plain object to a class instance.

**Method 1 — Direct constructor reference:**
```typescript
S7e.deserialize<T>(json: string | object, cls: Constructor<T>): T
```
Creates a new instance using the provided constructor. Only sets `@JsonProperty` properties. Throws if a required property is missing.

**Method 2 — String class name:**
```typescript
S7e.deserialize(json: string | object, className: string): object
```
Looks up the constructor from the type registry by name. Useful for dynamic/plugin architectures.

**Method 3 — Polymorphic array:**
```typescript
S7e.deserialize<T>(json: string | object[], cls: [Constructor<T>]): T[]
```
Deserializes an array, resolving each element's concrete type from its `$type` discriminator.

**Method 4 — Discriminator only (no second argument):**
```typescript
S7e.deserialize(json: string | object): object
```
Resolves the type entirely from the `$type` field. Requires the type to be registered via `S7e.registerTypes()`.

#### Type registry

```typescript
S7e.registerTypes(types: ClassConstructor[]): void
S7e.getRegisteredType(name: string): ClassConstructor | undefined
S7e.clearTypeRegistry(): void
```

#### Discriminator property

```typescript
S7e.setDiscriminatorProperty(name: string): void  // default: '$type'
S7e.getDiscriminatorProperty(): string
```

## 💡 Best Practices

### When to use @JsonClass

**✅ Recommended:**
```ts
// Always use @JsonClass for classes that will be serialized
@JsonClass({ name: 'User' })
class User {
  @JsonProperty({ name: 'id', type: String })
  id: string = '';
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
  id: string = '';

  // No explicit discriminator property needed
  // S7e will automatically add '$type' during serialization
}

@JsonClass({ name: 'UserEntity' })
class User extends BaseEntity {
  @JsonProperty({ name: 'name', type: String })
  name: string = '';
}

// Optional: configure a custom discriminator property name
S7e.setDiscriminatorProperty('entityType'); // defaults to '$type'
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

**🔧 Advanced Features**
- Circular reference handling
- Schema validation integration

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT

---

> Made with ❤️ by srn
