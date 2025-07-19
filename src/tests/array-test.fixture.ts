import { JsonProperty } from '../decorators/json-property';

export class ArrayTestClass {
  @JsonProperty({ name: 'stringArray', type: [String] })
  public stringArray: string[];

  @JsonProperty({ name: 'numberArray', type: [Number] })
  public numberArray: number[];

  @JsonProperty({ name: 'booleanArray', type: [Boolean] })
  public booleanArray: boolean[];

  @JsonProperty({ name: 'optionalStringArray', type: [String], optional: true })
  public optionalStringArray?: string[];

  constructor() {
    this.stringArray = [];
    this.numberArray = [];
    this.booleanArray = [];
  }
}

export class NestedClass {
  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'value', type: Number })
  public value: number;

  constructor(name?: string, value?: number) {
    this.name = name ?? '';
    this.value = value ?? 0;
  }
}

export class ClassWithNestedArray {
  @JsonProperty({ name: 'nestedArray', type: [NestedClass] })
  public nestedArray: NestedClass[];

  @JsonProperty({ name: 'title', type: String })
  public title: string;

  constructor() {
    this.nestedArray = [];
    this.title = '';
  }
}
