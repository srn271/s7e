import { JsonProperty } from '../decorators/json-property';

export class ArrayTestClass {
  @JsonProperty({ type: [String] })
  public stringArray: string[];

  @JsonProperty({ type: [Number] })
  public numberArray: number[];

  @JsonProperty({ type: [Boolean] })
  public booleanArray: boolean[];

  @JsonProperty({ type: [String], optional: true })
  public optionalStringArray?: string[];

  constructor() {
    this.stringArray = [];
    this.numberArray = [];
    this.booleanArray = [];
  }
}

export class NestedClass {
  @JsonProperty({ type: String })
  public name: string;

  @JsonProperty({ type: Number })
  public value: number;

  constructor(name?: string, value?: number) {
    this.name = name ?? '';
    this.value = value ?? 0;
  }
}

export class ClassWithNestedArray {
  @JsonProperty({ type: [NestedClass] })
  public nestedArray: NestedClass[];

  @JsonProperty({ type: String })
  public title: string;

  constructor() {
    this.nestedArray = [];
    this.title = '';
  }
}
