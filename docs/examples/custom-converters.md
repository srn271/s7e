# Custom Converters

Custom converters allow you to define how specific properties are serialized and deserialized. This is particularly useful for third-party types like `DateTime` from Luxon, `Decimal` from decimal.js, or any custom data structures that require special handling.

## Basic Converter

A converter is an object with two methods:
- `serialize`: Converts a TypeScript value to its JSON representation
- `deserialize`: Converts a JSON value back to its TypeScript representation

```typescript
import { Converter } from 's7e';

const dateConverter: Converter<Date, string> = {
  serialize: (value: Date) => value.toISOString(),
  deserialize: (value: string) => new Date(value)
};
```

## Using Converters with @JsonProperty

Simply add the `converter` option to your `@JsonProperty` decorator:

```typescript
import { JsonProperty, S7e, Converter } from 's7e';

// Define your converter
const dateConverter: Converter<Date, string> = {
  serialize: (value: Date) => value.toISOString(),
  deserialize: (value: string) => new Date(value)
};

class Meeting {
  @JsonProperty({ name: 'title', type: String })
  public title: string;

  @JsonProperty({ name: 'scheduledAt', converter: dateConverter })
  public scheduledAt: Date;

  constructor(title: string = '', scheduledAt: Date = new Date()) {
    this.title = title;
    this.scheduledAt = scheduledAt;
  }
}

// Usage
const meeting = new Meeting('Team Standup', new Date('2024-12-25T10:00:00Z'));
const obj = S7e.serialize(meeting);
console.log(obj);
// { title: 'Team Standup', scheduledAt: '2024-12-25T10:00:00.000Z' }

const deserialized = S7e.deserialize(obj, Meeting);
console.log(deserialized.scheduledAt instanceof Date); // true
```

## Third-Party Libraries

### Luxon DateTime

```typescript
import { DateTime } from 'luxon';
import { Converter, JsonProperty, S7e } from 's7e';

const dateTimeConverter: Converter<DateTime, string> = {
  serialize: (value: DateTime) => value.toISO(),
  deserialize: (value: string) => DateTime.fromISO(value)
};

class Event {
  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'eventDate', converter: dateTimeConverter })
  public eventDate: DateTime;

  constructor(name: string = '', eventDate?: DateTime) {
    this.name = name;
    this.eventDate = eventDate ?? DateTime.now();
  }
}

const event = new Event('Conference', DateTime.fromObject({ year: 2024, month: 6, day: 15 }));
const obj = S7e.serialize(event);
const restored = S7e.deserialize(obj, Event);
```

### Decimal.js

```typescript
import { Decimal } from 'decimal.js';
import { Converter, JsonProperty, S7e } from 's7e';

const decimalConverter: Converter<Decimal, string> = {
  serialize: (value: Decimal) => value.toString(),
  deserialize: (value: string) => new Decimal(value)
};

class Product {
  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'price', converter: decimalConverter })
  public price: Decimal;

  constructor(name: string = '', price?: Decimal) {
    this.name = name;
    this.price = price ?? new Decimal(0);
  }
}
```

## Arrays with Converters

Converters work seamlessly with arrays:

```typescript
import { Converter, JsonProperty, S7e } from 's7e';

const dateConverter: Converter<Date, string> = {
  serialize: (value: Date) => value.toISOString(),
  deserialize: (value: string) => new Date(value)
};

class Schedule {
  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'dates', converter: dateConverter })
  public dates: Date[];

  constructor(name: string = '', dates: Date[] = []) {
    this.name = name;
    this.dates = dates;
  }
}

const schedule = new Schedule('Project Milestones', [
  new Date('2024-01-01'),
  new Date('2024-06-15'),
  new Date('2024-12-31')
]);

const obj = S7e.serialize(schedule);
console.log(obj);
// {
//   name: 'Project Milestones',
//   dates: ['2024-01-01T00:00:00.000Z', '2024-06-15T00:00:00.000Z', '2024-12-31T00:00:00.000Z']
// }
```

## Optional Properties with Converters

Converters work with optional properties:

```typescript
import { Converter, JsonProperty, S7e } from 's7e';

const dateConverter: Converter<Date, string> = {
  serialize: (value: Date) => value.toISOString(),
  deserialize: (value: string) => new Date(value)
};

class Task {
  @JsonProperty({ name: 'title', type: String })
  public title: string;

  @JsonProperty({ name: 'dueDate', converter: dateConverter, optional: true })
  public dueDate?: Date;

  constructor(title: string = '', dueDate?: Date) {
    this.title = title;
    this.dueDate = dueDate;
  }
}

// Without due date
const task1 = new Task('Buy groceries');
const obj1 = S7e.serialize(task1);
console.log(obj1); // { title: 'Buy groceries' }

// With due date
const task2 = new Task('Submit report', new Date('2024-12-31'));
const obj2 = S7e.serialize(task2);
console.log(obj2); // { title: 'Submit report', dueDate: '2024-12-31T00:00:00.000Z' }
```

## Complex Type Conversion

You can use converters for any type conversion:

```typescript
import { Converter, JsonProperty, S7e } from 's7e';

// Convert numbers to formatted strings
const currencyConverter: Converter<number, string> = {
  serialize: (value: number, context: ConverterContext) => `$${value.toFixed(2)}`,
  deserialize: (value: string, context: ConverterContext) => parseFloat(value.replace('$', ''))
};

class Invoice {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'amount', converter: currencyConverter })
  public amount: number;

  constructor(id: number = 0, amount: number = 0) {
    this.id = id;
    this.amount = amount;
  }
}

const invoice = new Invoice(1, 99.99);
const obj = S7e.serialize(invoice);
console.log(obj); // { id: 1, amount: '$99.99' }

const restored = S7e.deserialize(obj, Invoice);
console.log(restored.amount); // 99.99
```

## Converter Priority

When both `type` and `converter` are specified, the converter takes precedence:

```typescript
import { Converter, JsonProperty, S7e } from 's7e';

const customConverter: Converter<string, number> = {
  serialize: (value: string, context) => value.length,
  deserialize: (value: number, context) => 'x'.repeat(value)
};

class Example {
  // Converter takes precedence over type
  @JsonProperty({ name: 'data', type: String, converter: customConverter })
  public data: string;

  constructor(data: string = '') {
    this.data = data;
  }
}

const example = new Example('hello');
const obj = S7e.serialize(example);
console.log(obj); // { data: 5 }

const restored = S7e.deserialize(obj, Example);
console.log(restored.data); // 'xxxxx'
```

## Context-Aware Converters

Converters always receive context information, including the parent object and property name. This enables advanced scenarios where conversion logic depends on other properties of the object.

### Converter Context

The context object is always provided with both required properties:
- `parent`: The parent object containing the property being converted
- `propertyName`: The name of the property being converted (JSON name from the decorator)

**Note:** Both `parent` and `propertyName` are always provided, including for array elements.

### Basic Context Usage

```typescript
import { Converter, ConverterContext, JsonProperty, S7e } from 's7e';

const contextAwareConverter: Converter<string, string> = {
  serialize: (value: string, context: ConverterContext) => {
    // Access context information - always available
    console.log('Parent object:', context.parent);
    console.log('Property name:', context.propertyName);
    return value.toUpperCase();
  },
  deserialize: (value: string, context: ConverterContext) => {
    return value.toLowerCase();
  }
};

class Document {
  @JsonProperty({ name: 'title', type: String })
  public title: string;

  @JsonProperty({ name: 'content', converter: contextAwareConverter })
  public content: string;

  constructor(title: string = '', content: string = '') {
    this.title = title;
    this.content = content;
  }
}

const doc = new Document('Test', 'hello');
const obj = S7e.serialize(doc);
// Context will include parent (the doc instance) and propertyName ('content')
```

### Conditional Conversion Based on Parent

A practical example where conversion logic depends on other properties:

```typescript
import { Converter, ConverterContext, JsonProperty, S7e } from 's7e';

const conditionalConverter: Converter<number, string> = {
  serialize: (value: number, context: ConverterContext) => {
    // Access parent object to make conversion decision
    const parent = context.parent as any;
    if (parent && parent.formatAsPercentage) {
      return `${(value * 100).toFixed(0)}%`;
    }
    return value.toString();
  },
  deserialize: (value: string, context: ConverterContext) => {
    if (value.endsWith('%')) {
      return parseFloat(value.replace('%', '')) / 100;
    }
    return parseFloat(value);
  }
};

class Report {
  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'value', converter: conditionalConverter })
  public value: number;

  // This property affects how 'value' is serialized
  public formatAsPercentage: boolean;

  constructor(name: string = '', value: number = 0, formatAsPercentage: boolean = false) {
    this.name = name;
    this.value = value;
    this.formatAsPercentage = formatAsPercentage;
  }
}

// With percentage formatting
const report1 = new Report('Sales', 0.85, true);
const obj1 = S7e.serialize(report1);
console.log(obj1); // { name: 'Sales', value: '85%' }

// Without percentage formatting
const report2 = new Report('Count', 42, false);
const obj2 = S7e.serialize(report2);
console.log(obj2); // { name: 'Count', value: '42' }
```

### Context Validation Example

Use context to validate relationships between properties:

```typescript
import { Converter, ConverterContext, JsonProperty, S7e } from 's7e';

const validatedConverter: Converter<number, number> = {
  serialize: (value: number, context: ConverterContext) => {
    const parent = context.parent as any;
    if (parent && parent.maxValue && value > parent.maxValue) {
      throw new Error(`Value ${value} exceeds maximum ${parent.maxValue}`);
    }
    return value;
  },
  deserialize: (value: number, context: ConverterContext) => {
    const parent = context.parent as any;
    if (parent && parent.maxValue && value > parent.maxValue) {
      throw new Error(`Value ${value} exceeds maximum ${parent.maxValue}`);
    }
    return value;
  }
};

class RangedValue {
  @JsonProperty({ name: 'maxValue', type: Number })
  public maxValue: number;

  @JsonProperty({ name: 'currentValue', converter: validatedConverter })
  public currentValue: number;

  constructor(maxValue: number = 100, currentValue: number = 0) {
    this.maxValue = maxValue;
    this.currentValue = currentValue;
  }
}

// Valid
const valid = new RangedValue(100, 50);
S7e.serialize(valid); // Works fine

// Invalid - throws error
const invalid = new RangedValue(100, 150);
// S7e.serialize(invalid); // Throws: Value 150 exceeds maximum 100
```

## Best Practices

1. **Type Safety**: Use TypeScript generics to ensure type safety:
   ```typescript
   const converter: Converter<MyType, string> = { ... };
   ```

2. **Error Handling**: Consider adding error handling in converters for invalid data:
   ```typescript
   const safeConverter: Converter<Date, string> = {
     serialize: (value: Date) => value.toISOString(),
     deserialize: (value: string) => {
       const date = new Date(value);
       if (isNaN(date.getTime())) {
         throw new Error(`Invalid date string: ${value}`);
       }
       return date;
     }
   };
   ```

3. **Reusability**: Define converters once and reuse them across your application:
   ```typescript
   // converters.ts
   export const dateConverter: Converter<Date, string> = { ... };
   export const dateTimeConverter: Converter<DateTime, string> = { ... };
   ```

4. **Null Handling**: The library automatically handles null values in arrays, but you may want to handle them explicitly in your converters if needed.

## Notes

- Converters work with both single values and arrays
- When using converters, the `type` parameter becomes optional (though you can still specify it for documentation)
- Converters are applied before any type validation
- Undefined optional properties are skipped during serialization, even with converters
