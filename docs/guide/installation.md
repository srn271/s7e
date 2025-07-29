# Installation

## Prerequisites

- **Node.js**: Version 16 or higher
- **TypeScript**: Version 4.5 or higher
- **Experimental Decorators**: Must be enabled in your TypeScript configuration

## Package Installation

Install S7E using your preferred package manager:

::: code-group

```bash [npm]
npm install s7e
```

```bash [yarn]
yarn add s7e
```

```bash [pnpm]
pnpm add s7e
```

```bash [bun]
bun add s7e
```

:::

## TypeScript Configuration

S7E uses TypeScript decorators, so you need to enable experimental decorators in your `tsconfig.json`:

```json{4-5}
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    // ... other options
  }
}
```

### Required Compiler Options

| Option | Value | Description |
|--------|-------|-------------|
| `experimentalDecorators` | `true` | Enables TypeScript decorator support |
| `emitDecoratorMetadata` | `true` | Enables metadata emission for decorators |
| `target` | `ES2022` or higher | Required for modern JavaScript features |

## Verification

To verify your installation is working correctly, create a simple test:

```typescript
// test-installation.ts
import { S7e, JsonClass, JsonProperty } from 's7e';

@JsonClass({ name: 'Test' })
class Test {
  @JsonProperty({ name: 'message', type: String })
  public message: string;

  constructor(message: string) {
    this.message = message;
  }
}

const test = new Test('Hello, S7E!');
const json = S7e.serialize(test);
const deserialized = S7e.deserialize(Test, json);

console.log('Original:', test);
console.log('JSON:', json);
console.log('Deserialized:', deserialized);
console.log('Instance check:', deserialized instanceof Test);
```

If everything is set up correctly, you should see output confirming the serialization and deserialization worked properly.

## Troubleshooting

### Common Issues

**Decorators not working**
- Ensure `experimentalDecorators` is set to `true` in `tsconfig.json`
- Check that `emitDecoratorMetadata` is enabled
- Verify your TypeScript version is 4.5 or higher

**Runtime errors in browser**
- Make sure your bundler is configured to handle TypeScript decorators
- Check that the target compilation is ES2022 or higher

**Import errors**
- Verify the package was installed correctly: `npm list s7e`
- Clear your node_modules and package-lock.json, then reinstall

Still having issues? Check our [GitHub Issues](https://github.com/srn271/s7e/issues) or create a new one.

## Next Steps

Now that S7E is installed, let's learn the [basic usage patterns](/guide/basic-usage)!
