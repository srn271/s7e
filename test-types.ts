import { JsonProperty, PrimitiveConstructor, ClassConstructor, TypeConstructor } from './src';

// Test that type definitions are working correctly
class TestAddress {
  @JsonProperty({ type: String })
  street: string;

  @JsonProperty({ type: String })
  city: string;

  constructor(street?: string, city?: string) {
    this.street = street ?? '';
    this.city = city ?? '';
  }
}

class TestUser {
  @JsonProperty({ type: String })
  name: string;

  @JsonProperty({ type: Number })
  age: number;

  @JsonProperty({ type: [String] })
  hobbies: string[];

  @JsonProperty({ type: [TestAddress] })
  addresses: TestAddress[];

  constructor() {
    this.name = '';
    this.age = 0;
    this.hobbies = [];
    this.addresses = [];
  }
}

// Type checks - these should all compile correctly
const stringType: PrimitiveConstructor = String;
const numberType: PrimitiveConstructor = Number;
const booleanType: PrimitiveConstructor = Boolean;

const addressConstructor: ClassConstructor<TestAddress> = TestAddress;
const userConstructor: ClassConstructor<TestUser> = TestUser;

const primitiveTypeConstructor: TypeConstructor = String;
const classTypeConstructor: TypeConstructor = TestAddress;

console.log('Type definitions are working correctly!');
console.log('PrimitiveConstructor examples:', { stringType, numberType, booleanType });
console.log('ClassConstructor examples:', { addressConstructor, userConstructor });
console.log('TypeConstructor examples:', { primitiveTypeConstructor, classTypeConstructor });
