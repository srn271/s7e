# s7e

> A TypeScript library for de-/serialization of TypeScript classes to and from JSON.

---

## 🚀 Features

- Serialize and deserialize TypeScript classes with ease
- Optional property support - Mark properties as optional for flexible serialization
- Type validation - Automatic type checking during deserialization
- Eager metadata loading - Fast property metadata access
- Supports modern JavaScript (ES2022)
- Works in both Node.js and browser environments
- Zero dependencies for core functionality
- Fully type-safe

## 📦 Installation

```sh
npm install s7e
```

## 🛠️ Usage Example

### Basic Usage

```ts
import { S7e, JsonProperty, JsonClass } from 's7e';

@JsonClass({ name: 'User' })
class User {
  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'age', type: Number })
  public age: number;

  @JsonProperty({ name: 'active', type: Boolean })
  public active: boolean;

  // Not serializable properties
  public password: string;
  public internalId: number;

  constructor(
    name: string,
    age: number,
    active: boolean = true,
    password?: string,
    internalId?: number
  ) {
    this.name = name;
    this.age = age;
    this.active = active;
    this.password = password ?? '';
    this.internalId = internalId ?? 0;
  }
}

const user = new User('Alice', 30, true, 'secret', 123);
const json = S7e.serialize(user); // '{"name":"Alice","age":30,"active":true}'
const restored = S7e.deserialize(json, User); // User { name: 'Alice', age: 30, active: true, password: '', internalId: 0 }
```

### Class-Level Configuration with @JsonClass

The `@JsonClass` decorator allows you to configure serialization behavior at the class level and prepares classes for advanced features:

```ts
import { S7e, JsonProperty, JsonClass } from 's7e';

// Basic usage - marks the class as serializable with a name
@JsonClass({ name: 'Product' })
class Product {
  @JsonProperty({ name: 'productName', type: String })
  public name: string;

  @JsonProperty({ name: 'price', type: Number })
  public price: number;

  constructor(name: string, price: number) {
    this.name = name;
    this.price = price;
  }
}

// Another example with different name
@JsonClass({ name: 'UserProfile' })
class User {
  @JsonProperty({ name: 'userName', type: String })
  public name: string;

  @JsonProperty({ name: 'userEmail', type: String })
  public email: string;

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }
}
```

#### Future Features (Coming Soon)

The `@JsonClass` decorator is designed to support advanced serialization patterns:

**🔄 Discriminator Support**
```ts
// Future feature - polymorphic serialization
@JsonClass({ name: 'Shape' })
abstract class Shape {
  // No explicit discriminator property needed - handled automatically
}

@JsonClass({ name: 'Circle' })
class Circle extends Shape {
  @JsonProperty({ name: 'radius', type: Number })
  radius: number;
}

@JsonClass({ name: 'Rectangle' })
class Rectangle extends Shape {
  @JsonProperty({ name: 'width', type: Number })
  width: number;

  @JsonProperty({ name: 'height', type: Number })
  height: number;
}

// Configure discriminator property (optional - defaults to '$type')
S7e.setDiscriminatorProperty('type'); // or keep default '$type'

// Serialization automatically adds discriminator
const circle = new Circle();
circle.radius = 5;
const json = S7e.serialize(circle);
// '{"$type":"Circle","radius":5}' (or '{"type":"Circle","radius":5}' if configured)

// Deserialization automatically detects type
const shapes: Shape[] = S7e.deserialize(json, [Shape]); // Automatically creates Circle and Rectangle instances
```

**⚡ Lazy Loading**
```ts
// Future feature - lazy loading of complex objects
@JsonClass({ name: 'User' })
class User {
  @JsonProperty({ name: 'id', type: String })
  id: string;

  @JsonProperty({ name: 'profile', type: 'UserProfile' })
  profile: UserProfile; // Will be loaded on-demand using string reference

  @JsonProperty({ name: 'friends', type: ['User'] })
  friends: User[]; // Array of lazy-loaded users
}

@JsonClass({ name: 'UserProfile' })
class UserProfile {
  @JsonProperty({ name: 'bio', type: String })
  bio: string;

  @JsonProperty({ name: 'preferences', type: 'UserPreferences' })
  preferences: UserPreferences; // Nested lazy loading
}

// Will enable on-demand loading of referenced objects
const user = S7e.deserialize(json, User);
// user.profile and user.friends will be resolved automatically when accessed
// String type references enable lazy resolution through the type registry
```

**🏷️ Type Registry**
```ts
// Future feature - automatic type registration
// The @JsonClass name will be used for type lookup and registration
S7e.registerTypes([User, Product, Circle, Rectangle]);
const obj = S7e.deserialize(json, 'UserProfile'); // Automatic type resolution using string name
```

### Optional Properties

```ts
import { S7e, JsonProperty, JsonClass } from 's7e';

@JsonClass({ name: 'Profile' })
class Profile {
  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'nickname', type: String, optional: true })
  public nickname: string | undefined; // Optional property

  @JsonProperty({ name: 'age', type: Number })
  public age: number;

  constructor(name?: string, age?: number, nickname?: string) {
    this.name = name ?? '';
    this.age = age ?? 0;
    this.nickname = nickname;
  }
}

// Serialization skips undefined optional properties
const profile1 = new Profile('Bob', 25); // nickname is undefined
const json1 = S7e.serialize(profile1); // '{"name":"Bob","age":25}'

// Serialization includes defined optional properties
const profile2 = new Profile('Alice', 30, 'Al');
const json2 = S7e.serialize(profile2); // '{"name":"Alice","age":30,"nickname":"Al"}'

// Deserialization works with missing optional properties
const restored1 = S7e.deserialize('{"name":"Charlie","age":35}', Profile);
// Profile { name: 'Charlie', age: 35, nickname: undefined }

// Required properties must be present
try {
  S7e.deserialize('{"name":"Dave"}', Profile); // Missing required 'age'
} catch (error) {
  console.error(error.message); // "Missing required property 'age' in JSON during deserialization."
}
```

### Array Support

```ts
import { S7e, JsonProperty } from 's7e';

class BlogPost {
  @JsonProperty({ name: 'title', type: String })
  public title: string;

  @JsonProperty({ name: 'tags', type: [String] })
  public tags: string[];

  @JsonProperty({ name: 'ratings', type: [Number] })
  public ratings: number[];

  constructor() {
    this.title = '';
    this.tags = [];
    this.ratings = [];
  }
}

// Arrays of nested objects
class Comment {
  @JsonProperty({ name: 'author', type: String })
  public author: string;

  @JsonProperty({ name: 'content', type: String })
  public content: string;

  constructor(author?: string, content?: string) {
    this.author = author ?? '';
    this.content = content ?? '';
  }
}

class Article {
  @JsonProperty({ name: 'title', type: String })
  public title: string;

  @JsonProperty({ name: 'comments', type: [Comment] })
  public comments: Comment[];

  constructor() {
    this.title = '';
    this.comments = [];
  }
}

// Usage
const article = new Article();
article.title = 'My Article';
article.comments = [
  new Comment('Alice', 'Great post!'),
  new Comment('Bob', 'Thanks for sharing!')
];

const json = S7e.serialize(article);
// '{"title":"My Article","comments":[{"author":"Alice","content":"Great post!"},{"author":"Bob","content":"Thanks for sharing!"}]}'

const restored = S7e.deserialize(json, Article);
// Article with properly deserialized Comment instances
console.log(restored.comments[0] instanceof Comment); // true
```

## 📋 API Reference

### `@JsonProperty(options)`

Decorator to mark a property for JSON serialization/deserialization.

**Options:**
- `name: string` - **Required**. The JSON property name for serialization/deserialization (mandatory for minification compatibility)
- `type: TypeConstructor | [TypeConstructor] | string | [string]` - **Required**. The type constructor for this property
  - Direct references: `String`, `Number`, `Boolean`, or custom class constructor
  - Arrays: `[String]`, `[Number]`, `[Boolean]`, or `[CustomClass]`
  - Lazy references: `'CustomClass'` or `['CustomClass']` - enables lazy loading via type registry
- `optional?: boolean` - Whether the property is optional (default: `false`)
  - `true`: Property can be missing during deserialization, undefined values are skipped during serialization
  - `false`: Property is required during deserialization

### `@JsonClass(options)`

Decorator to mark a class for JSON serialization/deserialization and enable advanced features.

**Options:**
- `name: string` - **Required**. The unique name identifier for the class
  - Used for type discrimination in polymorphic scenarios
  - Enables lazy loading and type registry features
  - Must be unique across your application

**Benefits:**
- 🔍 **Type Identification**: Enables automatic type detection during deserialization
- 🚀 **Performance**: Optimizes metadata access and reduces initialization overhead
- 🔄 **Future-Ready**: Prepares your classes for discriminator and lazy-loading features
- 📋 **Type Registry**: Allows automatic type registration and lookup by name

**Current Usage:**
```ts
@JsonClass({ name: 'MyClass' })
class MyClass {
  @JsonProperty({ name: 'prop', type: String })
  prop: string;
}

// Check if a class is decorated
import { isJsonClass, getJsonClassName } from 's7e';
console.log(isJsonClass(MyClass)); // true
console.log(getJsonClassName(MyClass)); // 'MyClass'
```
  - `false`: Property is required during deserialization

### `S7e.serialize<T>(instance: T): string`

Serializes a class instance to a JSON string.
- Only properties marked with `@JsonProperty` are included
- Undefined optional properties are automatically skipped

### `S7e.deserialize<T>(json: string, cls: Constructor<T>): T`
### `S7e.deserialize(json: string, className: string): any` *(Future)*

Deserializes a JSON string to a class instance.

**Method 1 - Direct Constructor Reference:**
- Creates a new instance using the provided constructor
- Only sets properties marked with `@JsonProperty`
- Validates types if specified in the decorator
- Throws error if required properties are missing

**Method 2 - String Class Name (Future):**
- Looks up the class constructor using the `@JsonClass` name from the type registry
- Enables dynamic type resolution without importing the class
- Useful for polymorphic deserialization and plugin architectures

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

**🔄 Discriminator Support** (v0.1.0)
- Automatic polymorphic deserialization based on `@JsonClass` names
- Implicit discriminator property injection (default: `$type`)
- Configurable discriminator property name via `S7e.setDiscriminatorProperty()`
- Support for inheritance hierarchies with automatic type discrimination

**⚡ Lazy Loading** (v0.2.0)
- String-based type references for lazy loading: `type: 'ClassName'` and `type: ['ClassName']`
- On-demand resolution of complex nested objects through type registry
- Memory optimization for large object graphs
- Circular reference support via string type references

**🏷️ Type Registry** (v0.3.0)
- Automatic type registration using `@JsonClass` names
- Overloaded `S7e.deserialize(json, 'ClassName')` for dynamic type resolution
- Global type lookup and management

**🔧 Advanced Features** (v0.4.0+)
- Circular reference handling
- Custom serialization hooks
- Schema validation integration
- Performance optimizations

*The `@JsonClass` decorator is already designed to support these features. Start using it now to future-proof your code!*

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT

---

> Made with ❤️ by srn
