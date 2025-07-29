# Decorators

S7E provides two main decorators for configuring JSON serialization and deserialization behavior in your TypeScript classes.

## @JsonClass

The `@JsonClass` decorator marks a class as serializable and provides configuration options for the entire class.

### Syntax

```typescript
@JsonClass(options: JsonClassOptions)
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options` | `JsonClassOptions` | Yes | Configuration options for the class |
| `options.name` | `string` | Yes | Unique name for the class used in polymorphic serialization |

### Usage

```typescript
import { JsonClass } from 's7e';

@JsonClass({ name: 'User' })
class User {
  // Class implementation
}
```

### Examples

#### Basic Class Declaration

```typescript
@JsonClass({ name: 'Product' })
class Product {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'price', type: Number })
  public price: number;
}
```

#### Polymorphic Classes

```typescript
@JsonClass({ name: 'Vehicle' })
abstract class Vehicle {
  @JsonProperty({ name: 'brand', type: String })
  public brand: string;

  @JsonProperty({ name: 'model', type: String })
  public model: string;
}

@JsonClass({ name: 'Car' })
class Car extends Vehicle {
  @JsonProperty({ name: 'doors', type: Number })
  public doors: number;

  @JsonProperty({ name: 'fuelType', type: String })
  public fuelType: string;
}

@JsonClass({ name: 'Motorcycle' })
class Motorcycle extends Vehicle {
  @JsonProperty({ name: 'engineSize', type: Number })
  public engineSize: number;

  @JsonProperty({ name: 'hasSidecar', type: Boolean })
  public hasSidecar: boolean;
}
```

### Best Practices

1. **Use descriptive names**: Choose clear, descriptive names for your classes
2. **Ensure uniqueness**: Each `@JsonClass` name should be unique across your application
3. **Follow naming conventions**: Use PascalCase for consistency with TypeScript class naming

```typescript
// Good
@JsonClass({ name: 'UserProfile' })
@JsonClass({ name: 'ShoppingCart' })
@JsonClass({ name: 'PaymentMethod' })

// Avoid
@JsonClass({ name: 'data' })
@JsonClass({ name: 'obj' })
@JsonClass({ name: 'temp' })
```

---

## @JsonProperty

The `@JsonProperty` decorator configures how individual class properties are serialized and deserialized.

### Syntax

```typescript
@JsonProperty(options: JsonPropertyOptions)
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options` | `JsonPropertyOptions` | Yes | Configuration options for the property |
| `options.name` | `string` | Yes | JSON property name (required for minification compatibility) |
| `options.type` | `TypeConstructor \| [TypeConstructor]` | No | Type constructor or array of type constructors |
| `options.optional` | `boolean` | No | Whether the property is optional (default: `false`) |

### Type Options

#### Primitive Types

```typescript
@JsonProperty({ name: 'stringValue', type: String })
public stringValue: string;

@JsonProperty({ name: 'numberValue', type: Number })
public numberValue: number;

@JsonProperty({ name: 'booleanValue', type: Boolean })
public booleanValue: boolean;

@JsonProperty({ name: 'dateValue', type: Date })
public dateValue: Date;
```

#### Object Types

```typescript
@JsonProperty({ name: 'address', type: Address })
public address: Address;

@JsonProperty({ name: 'user', type: User })
public user: User;
```

#### Array Types

```typescript
// Array of primitives
@JsonProperty({ name: 'tags', type: [String] })
public tags: string[];

@JsonProperty({ name: 'scores', type: [Number] })
public scores: number[];

// Array of objects
@JsonProperty({ name: 'addresses', type: [Address] })
public addresses: Address[];

@JsonProperty({ name: 'users', type: [User] })
public users: User[];
```

### Usage Examples

#### Basic Property Configuration

```typescript
@JsonClass({ name: 'Employee' })
class Employee {
  @JsonProperty({ name: 'employeeId', type: Number })
  public id: number;

  @JsonProperty({ name: 'firstName', type: String })
  public firstName: string;

  @JsonProperty({ name: 'lastName', type: String })
  public lastName: string;

  @JsonProperty({ name: 'salary', type: Number })
  public salary: number;

  @JsonProperty({ name: 'isActive', type: Boolean })
  public active: boolean;

  @JsonProperty({ name: 'hireDate', type: Date })
  public hireDate: Date;
}
```

#### Optional Properties

```typescript
@JsonClass({ name: 'UserProfile' })
class UserProfile {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'username', type: String })
  public username: string;

  @JsonProperty({ name: 'email', type: String, optional: true })
  public email?: string;

  @JsonProperty({ name: 'phoneNumber', type: String, optional: true })
  public phoneNumber?: string;

  @JsonProperty({ name: 'biography', type: String, optional: true })
  public biography?: string;
}
```

#### Custom Property Naming

Map TypeScript property names to different JSON property names:

```typescript
@JsonClass({ name: 'ApiUser' })
class ApiUser {
  @JsonProperty({ name: 'user_id', type: Number })
  public userId: number;

  @JsonProperty({ name: 'first_name', type: String })
  public firstName: string;

  @JsonProperty({ name: 'last_name', type: String })
  public lastName: string;

  @JsonProperty({ name: 'email_address', type: String })
  public emailAddress: string;

  @JsonProperty({ name: 'created_at', type: String })
  public createdAt: string;

  @JsonProperty({ name: 'updated_at', type: String })
  public updatedAt: string;
}
```

#### Complex Nested Objects

```typescript
@JsonClass({ name: 'Order' })
class Order {
  @JsonProperty({ name: 'orderId', type: String })
  public id: string;

  @JsonProperty({ name: 'customer', type: Customer })
  public customer: Customer;

  @JsonProperty({ name: 'items', type: [OrderItem] })
  public items: OrderItem[];

  @JsonProperty({ name: 'shippingAddress', type: Address })
  public shippingAddress: Address;

  @JsonProperty({ name: 'billingAddress', type: Address, optional: true })
  public billingAddress?: Address;

  @JsonProperty({ name: 'orderDate', type: Date })
  public orderDate: Date;

  @JsonProperty({ name: 'totalAmount', type: Number })
  public totalAmount: number;
}

@JsonClass({ name: 'OrderItem' })
class OrderItem {
  @JsonProperty({ name: 'productId', type: String })
  public productId: string;

  @JsonProperty({ name: 'quantity', type: Number })
  public quantity: number;

  @JsonProperty({ name: 'unitPrice', type: Number })
  public unitPrice: number;

  @JsonProperty({ name: 'product', type: Product })
  public product: Product;
}
```

### Type Inference

While specifying the `type` parameter is recommended for clarity and reliability, S7E can infer types in some cases:

```typescript
@JsonClass({ name: 'InferredTypes' })
class InferredTypes {
  // Type specified (recommended)
  @JsonProperty({ name: 'explicitString', type: String })
  public explicitString: string;

  // Type can be inferred for primitives (but not recommended)
  @JsonProperty({ name: 'inferredNumber' })
  public inferredNumber: number;

  // Arrays always need explicit type specification
  @JsonProperty({ name: 'stringArray', type: [String] })
  public stringArray: string[];

  // Objects always need explicit type specification
  @JsonProperty({ name: 'user', type: User })
  public user: User;
}
```

### Validation Behavior

Properties decorated with `@JsonProperty` undergo automatic type validation during deserialization:

```typescript
@JsonClass({ name: 'ValidatedClass' })
class ValidatedClass {
  @JsonProperty({ name: 'requiredString', type: String })
  public requiredString: string;

  @JsonProperty({ name: 'optionalNumber', type: Number, optional: true })
  public optionalNumber?: number;
}

// This will succeed
const validJson = '{"requiredString":"hello","optionalNumber":42}';
const valid = S7e.deserialize(ValidatedClass, validJson);

// This will throw an error - missing required property
const invalidJson1 = '{"optionalNumber":42}';

// This will throw an error - wrong type
const invalidJson2 = '{"requiredString":123,"optionalNumber":42}';

// This will succeed - optional property can be omitted
const validJson2 = '{"requiredString":"hello"}';
```

### Best Practices

#### 1. Always Specify JSON Names

```typescript
// Good - explicit JSON property names
@JsonProperty({ name: 'userId', type: Number })
public id: number;

// Avoid - missing JSON name (can break with minification)
@JsonProperty({ type: Number })
public id: number;
```

#### 2. Use Consistent Naming Conventions

```typescript
// API uses snake_case
@JsonProperty({ name: 'user_name', type: String })
public userName: string;

@JsonProperty({ name: 'email_address', type: String })
public emailAddress: string;

// API uses camelCase
@JsonProperty({ name: 'userName', type: String })
public userName: string;

@JsonProperty({ name: 'emailAddress', type: String })
public emailAddress: string;
```

#### 3. Specify Types Explicitly

```typescript
// Good - explicit types
@JsonProperty({ name: 'count', type: Number })
public count: number;

@JsonProperty({ name: 'items', type: [String] })
public items: string[];

@JsonProperty({ name: 'user', type: User })
public user: User;

// Avoid - relying on type inference
@JsonProperty({ name: 'count' })
public count: number;
```

#### 4. Use Optional Properties Appropriately

```typescript
// Good - mark truly optional properties
@JsonProperty({ name: 'phone', type: String, optional: true })
public phoneNumber?: string;

// Avoid - making required data optional
@JsonProperty({ name: 'id', type: Number, optional: true })
public id?: number; // ID should typically be required
```

#### 5. Document Complex Types

```typescript
@JsonClass({ name: 'ComplexData' })
class ComplexData {
  /**
   * Array of user IDs associated with this data
   */
  @JsonProperty({ name: 'userIds', type: [Number] })
  public userIds: number[];

  /**
   * Nested configuration object
   */
  @JsonProperty({ name: 'config', type: Configuration })
  public configuration: Configuration;

  /**
   * Optional metadata that may not be present in all API responses
   */
  @JsonProperty({ name: 'metadata', type: Metadata, optional: true })
  public metadata?: Metadata;
}
```

## Related APIs

- [S7e Class Methods](/api/s7e-class) - Core serialization and deserialization methods
- [Type Definitions](/api/types) - Complete type reference for all options
- [Advanced Features](/guide/advanced-features) - Polymorphism, arrays, and complex scenarios
