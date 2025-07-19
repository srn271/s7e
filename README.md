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
import { S7e, JsonProperty } from 's7e';

class User {
  @JsonProperty({ type: String })
  public name: string;

  @JsonProperty({ type: Number })
  public age: number;

  @JsonProperty({ type: Boolean })
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

### Optional Properties

```ts
import { S7e, JsonProperty } from 's7e';

class Profile {
  @JsonProperty({ type: String })
  public name: string;

  @JsonProperty({ type: String, optional: true })
  public nickname: string | undefined; // Optional property

  @JsonProperty({ type: Number })
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
  @JsonProperty({ type: String })
  public title: string;

  @JsonProperty({ type: [String] })
  public tags: string[];

  @JsonProperty({ type: [Number] })
  public ratings: number[];

  constructor() {
    this.title = '';
    this.tags = [];
    this.ratings = [];
  }
}

// Arrays of nested objects
class Comment {
  @JsonProperty({ type: String })
  public author: string;

  @JsonProperty({ type: String })
  public content: string;

  constructor(author?: string, content?: string) {
    this.author = author ?? '';
    this.content = content ?? '';
  }
}

class Article {
  @JsonProperty({ type: String })
  public title: string;

  @JsonProperty({ type: [Comment] })
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

### `@JsonProperty(options?)`

Decorator to mark a property for JSON serialization/deserialization.

**Options:**
- `type?: TypeConstructor | [TypeConstructor]` - The type constructor for this property
  - Single values: `String`, `Number`, `Boolean`, or custom class constructor
  - Arrays: `[String]`, `[Number]`, `[Boolean]`, or `[CustomClass]`
- `optional?: boolean` - Whether the property is optional (default: `false`)
  - `true`: Property can be missing during deserialization, undefined values are skipped during serialization
  - `false`: Property is required during deserialization

### `S7e.serialize<T>(instance: T): string`

Serializes a class instance to a JSON string.
- Only properties marked with `@JsonProperty` are included
- Undefined optional properties are automatically skipped

### `S7e.deserialize<T>(json: string, cls: Constructor<T>): T`

Deserializes a JSON string to a class instance.
- Creates a new instance using the provided constructor
- Only sets properties marked with `@JsonProperty`
- Validates types if specified in the decorator
- Throws error if required properties are missing

## 🧪 Testing

```sh
npm test
```

## 🏗️ Build

```sh
npm run build
```

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT

---

> Made with ❤️ by srn
