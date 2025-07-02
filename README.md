# s7e

> A TypeScript library for de-/serialization of TypeScript classes to and from JSON.

---

## 🚀 Features

- Serialize and deserialize TypeScript classes with ease
- Supports modern JavaScript (ES2022)
- Works in both Node.js and browser environments
- Zero dependencies for core functionality
- Fully type-safe

## 📦 Installation

```sh
npm install s7e
```

## 🛠️ Usage Example

```ts
import { S7e, JsonProperty } from 's7e';

class User {
  @JsonProperty({ type: String })
  public name: string;

  @JsonProperty({ type: Number })
  public age: number;

  // Not serializable properties
  public password: string;
  public internalId: number;

  constructor(
    name: string,
    age: number,
    password?: string,
    internalId?: number
  ) {
    this.name = name;
    this.age = age;
    this.password = password ?? '';
    this.internalId = internalId ?? 0;
  }
}

const user = new User('Alice', 30, 'secret', 123);
const json = S7e.serialize(user); // '{"name":"Alice","age":30}'
const restored = S7e.deserialize(User, json); // User { name: 'Alice', age: 30, password: '', internalId: 0 }
```

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
