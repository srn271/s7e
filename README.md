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
import { serialize, deserialize } from 's7e';

class User {
  constructor(public name: string, public age: number) {}
}

const user = new User('Alice', 30);
const json = serialize(user); // '{"name":"Alice","age":30}'
const restored = deserialize(User, json); // User { name: 'Alice', age: 30 }
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
