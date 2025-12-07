import { describe, expect, test } from 'vitest';
import { S7e } from '../core/s7e';
import { JsonProperty } from '../decorators/json-property';
import type { Converter, ConverterContext } from '../types/converter.type';
import { TestUtils } from './test-utils';

TestUtils.setupCleanState();

// Date converter - converts Date to ISO string
const dateConverter: Converter<Date, string> = {
  serialize: (value, _ctx) => value.toISOString(),
  deserialize: (value, _ctx) => new Date(value),
};

// Number to string converter
const numberToStringConverter: Converter<number, string> = {
  serialize: (value, _ctx) => value.toString(),
  deserialize: (value, _ctx) => parseFloat(value),
};

describe('Custom Converter', () => {
  test('basic serialization and deserialization', () => {
    class Event {
      @JsonProperty({ name: 'date', converter: dateConverter })
      date = new Date('2024-12-25T10:00:00.000Z');
    }

    const serialized = S7e.serialize(new Event());
    expect(serialized).toEqual({ date: '2024-12-25T10:00:00.000Z' });

    const deserialized = S7e.deserialize(serialized, Event);
    expect(deserialized.date.toISOString()).toBe('2024-12-25T10:00:00.000Z');
  });

  test('round-trip with multiple properties', () => {
    class Event {
      @JsonProperty({ name: 'name', type: String })
      name = 'Conference';

      @JsonProperty({ name: 'date', converter: dateConverter })
      date = new Date('2024-06-15T12:00:00.000Z');
    }

    const original = new Event();
    const roundTrip = S7e.deserialize(S7e.serialize(original), Event);
    expect(roundTrip.name).toBe('Conference');
    expect(roundTrip.date.toISOString()).toBe(original.date.toISOString());
  });

  test('array serialization and deserialization', () => {
    class Schedule {
      @JsonProperty({ name: 'dates', converter: dateConverter })
      dates = [
        new Date('2024-01-01T00:00:00.000Z'),
        new Date('2024-06-15T00:00:00.000Z'),
        new Date('2024-12-25T00:00:00.000Z'),
      ];
    }

    const serialized = S7e.serialize(new Schedule());
    expect(serialized).toEqual({
      dates: ['2024-01-01T00:00:00.000Z', '2024-06-15T00:00:00.000Z', '2024-12-25T00:00:00.000Z'],
    });

    const deserialized = S7e.deserialize(serialized, Schedule);
    expect(deserialized.dates).toHaveLength(3);
    expect(deserialized.dates[0].toISOString()).toBe('2024-01-01T00:00:00.000Z');
  });

  test('empty array', () => {
    class Schedule {
      @JsonProperty({ name: 'dates', converter: dateConverter })
      dates: Date[] = [];
    }

    const roundTrip = S7e.deserialize(S7e.serialize(new Schedule()), Schedule);
    expect(roundTrip.dates).toEqual([]);
  });

  test('optional property - undefined', () => {
    class Task {
      @JsonProperty({ name: 'title', type: String })
      title = 'Buy groceries';

      @JsonProperty({ name: 'due', converter: dateConverter, optional: true })
      due?: Date;
    }

    const serialized = S7e.serialize(new Task());
    expect(serialized).toEqual({ title: 'Buy groceries' });
    expect(serialized).not.toHaveProperty('due');
  });

  test('optional property - defined', () => {
    class Task {
      @JsonProperty({ name: 'title', type: String })
      title = 'Task';

      @JsonProperty({ name: 'due', converter: dateConverter, optional: true })
      due = new Date('2024-12-31T00:00:00.000Z');
    }

    const serialized = S7e.serialize(new Task());
    expect(serialized).toEqual({ title: 'Task', due: '2024-12-31T00:00:00.000Z' });
  });

  test('optional property - missing in JSON', () => {
    class Task {
      @JsonProperty({ name: 'title', type: String })
      title = '';

      @JsonProperty({ name: 'due', converter: dateConverter, optional: true })
      due?: Date;
    }

    const deserialized = S7e.deserialize({ title: 'Task' }, Task);
    expect(deserialized.title).toBe('Task');
    expect(deserialized.due).toBeUndefined();
  });

  test('null values in arrays', () => {
    class Schedule {
      @JsonProperty({ name: 'dates', converter: dateConverter })
      dates = [new Date('2024-01-01T00:00:00.000Z'), null, new Date('2024-12-25T00:00:00.000Z')] as (Date | null)[];
    }

    const serialized = S7e.serialize(new Schedule());
    expect(serialized).toEqual({ dates: ['2024-01-01T00:00:00.000Z', null, '2024-12-25T00:00:00.000Z'] });

    const deserialized = S7e.deserialize(serialized, Schedule);
    expect(deserialized.dates[0]?.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    expect(deserialized.dates[1]).toBeNull();
  });

  test('type conversion', () => {
    class Product {
      @JsonProperty({ name: 'name', type: String })
      name = 'Widget';

      @JsonProperty({ name: 'price', converter: numberToStringConverter })
      price = 19.99;
    }

    const serialized = S7e.serialize(new Product());
    expect(serialized).toEqual({ name: 'Widget', price: '19.99' });

    const deserialized = S7e.deserialize(serialized, Product);
    expect(deserialized.price).toBe(19.99);
  });

  test('multiple converters', () => {
    class Event {
      @JsonProperty({ name: 'title', type: String })
      title = 'Conference';

      @JsonProperty({ name: 'start', converter: dateConverter })
      start = new Date('2024-06-15T09:00:00.000Z');

      @JsonProperty({ name: 'end', converter: dateConverter })
      end = new Date('2024-06-17T17:00:00.000Z');

      @JsonProperty({ name: 'attendees', converter: numberToStringConverter })
      attendees = 150;
    }

    const serialized = S7e.serialize(new Event());
    expect(serialized).toEqual({
      title: 'Conference',
      start: '2024-06-15T09:00:00.000Z',
      end: '2024-06-17T17:00:00.000Z',
      attendees: '150',
    });

    const deserialized = S7e.deserialize(serialized, Event);
    expect(deserialized.start.toISOString()).toBe('2024-06-15T09:00:00.000Z');
    expect(deserialized.attendees).toBe(150);
  });

  test('converter priority over type', () => {
    class Document {
      @JsonProperty({ name: 'content', type: String, converter: numberToStringConverter })
      content = 42;
    }

    const serialized = S7e.serialize(new Document());
    expect(serialized).toEqual({ content: '42' });

    const deserialized = S7e.deserialize(serialized, Document);
    expect(deserialized.content).toBe(42);
  });

  test('context passed during serialization', () => {
    let capturedContext: ConverterContext | null = null;

    class Doc {
      @JsonProperty({ name: 'title', type: String })
      title = 'Test';

      @JsonProperty({
        name: 'content',
        converter: {
          serialize: (v, ctx) => {
            capturedContext = ctx;
            return v.toUpperCase();
          },
          deserialize: (v, _ctx) => v.toLowerCase(),
        },
      })
      content = 'hello';
    }

    const doc = new Doc();
    S7e.serialize(doc);

    expect(capturedContext?.parent).toBe(doc);
    expect(capturedContext?.propertyName).toBe('content');
  });

  test('context passed during deserialization', () => {
    let capturedContext: ConverterContext | null = null;

    class Doc {
      @JsonProperty({ name: 'title', type: String })
      title = '';

      @JsonProperty({
        name: 'content',
        converter: {
          serialize: (v, _ctx) => v.toUpperCase(),
          deserialize: (v, ctx) => {
            capturedContext = ctx;
            return v.toLowerCase();
          },
        },
      })
      content = '';
    }

    const deserialized = S7e.deserialize({ title: 'Test', content: 'HELLO' }, Doc);

    expect(capturedContext?.parent).toBe(deserialized);
    expect(capturedContext?.propertyName).toBe('content');
    expect(deserialized.content).toBe('hello');
  });

  test('context for array elements', () => {
    const capturedContexts: ConverterContext[] = [];

    class Doc {
      @JsonProperty({
        name: 'tags',
        converter: {
          serialize: (v, ctx) => {
            capturedContexts.push(ctx);
            return v.toUpperCase();
          },
          deserialize: (v, _ctx) => v.toLowerCase(),
        },
      })
      tags = ['tag1', 'tag2', 'tag3'];
    }

    const doc = new Doc();
    S7e.serialize(doc);

    expect(capturedContexts).toHaveLength(3);
    capturedContexts.forEach((ctx) => {
      expect(ctx.parent).toBe(doc);
      expect(ctx.propertyName).toBe('tags');
    });
  });

  test('conditional conversion using parent', () => {
    const conditionalConverter: Converter<number, string> = {
      serialize: (value, ctx) => {
        const parent = ctx.parent as any;
        return parent?.formatAsPercentage ? `${(value * 100).toFixed(0)}%` : value.toString();
      },
      deserialize: (value, _ctx) => {
        return value.endsWith('%') ? parseFloat(value.replace('%', '')) / 100 : parseFloat(value);
      },
    };

    class Report {
      @JsonProperty({ name: 'name', type: String })
      name = 'Sales';

      @JsonProperty({ name: 'value', converter: conditionalConverter })
      value = 0.85;

      formatAsPercentage = true;
    }

    const serialized = S7e.serialize(new Report());
    expect(serialized).toEqual({ name: 'Sales', value: '85%' });

    const deserialized = S7e.deserialize(serialized, Report);
    expect(deserialized.value).toBe(0.85);
  });
});
