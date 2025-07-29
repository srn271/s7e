# Advanced Features

S7E provides powerful advanced features for complex serialization scenarios. This guide covers optional properties, polymorphic serialization, custom naming strategies, and more.

## Optional Properties

S7E supports optional properties that may or may not be present in JSON data.

### Basic Optional Properties

```typescript
import { S7e, JsonClass, JsonProperty } from 's7e';

@JsonClass({ name: 'UserProfile' })
class UserProfile {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'email', type: String, optional: true })
  public email?: string;

  @JsonProperty({ name: 'phone', type: String, optional: true })
  public phone?: string;

  @JsonProperty({ name: 'age', type: Number, optional: true })
  public age?: number;
}

// JSON with all properties
const fullJson = '{"id":1,"name":"John","email":"john@example.com","phone":"123-456-7890","age":30}';
const fullUser = S7e.deserialize(UserProfile, fullJson);

// JSON with only required properties
const minimalJson = '{"id":2,"name":"Jane"}';
const minimalUser = S7e.deserialize(UserProfile, minimalJson);
console.log(minimalUser.email); // undefined
console.log(minimalUser.phone); // undefined
```

### Optional Properties with Default Values

```typescript
@JsonClass({ name: 'Settings' })
class Settings {
  @JsonProperty({ name: 'theme', type: String, optional: true })
  public theme?: string;

  @JsonProperty({ name: 'notifications', type: Boolean, optional: true })
  public notifications?: boolean;

  @JsonProperty({ name: 'language', type: String, optional: true })
  public language?: string;

  constructor() {
    // Set default values
    this.theme = 'light';
    this.notifications = true;
    this.language = 'en';
  }

  public static fromJson(json: string): Settings {
    const settings = S7e.deserialize(Settings, json);

    // Apply defaults for undefined optional properties
    settings.theme = settings.theme ?? 'light';
    settings.notifications = settings.notifications ?? true;
    settings.language = settings.language ?? 'en';

    return settings;
  }
}
```

## Polymorphic Serialization

S7E supports polymorphic serialization with automatic type discrimination.

### Setting Up Polymorphic Classes

```typescript
@JsonClass({ name: 'Animal' })
abstract class Animal {
  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'age', type: Number })
  public age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

@JsonClass({ name: 'Dog' })
class Dog extends Animal {
  @JsonProperty({ name: 'breed', type: String })
  public breed: string;

  @JsonProperty({ name: 'isGoodBoy', type: Boolean })
  public isGoodBoy: boolean;

  constructor(name: string, age: number, breed: string) {
    super(name, age);
    this.breed = breed;
    this.isGoodBoy = true;
  }
}

@JsonClass({ name: 'Cat' })
class Cat extends Animal {
  @JsonProperty({ name: 'indoor', type: Boolean })
  public indoor: boolean;

  @JsonProperty({ name: 'livesLeft', type: Number })
  public livesLeft: number;

  constructor(name: string, age: number, indoor: boolean) {
    super(name, age);
    this.indoor = indoor;
    this.livesLeft = 9;
  }
}
```

### Registering Types for Polymorphic Deserialization

```typescript
// Register all polymorphic types
S7e.registerTypes([Dog, Cat]);

// Create instances
const dog = new Dog('Buddy', 3, 'Golden Retriever');
const cat = new Cat('Whiskers', 2, true);

// Serialize (automatically includes type discriminator)
const dogJson = S7e.serialize(dog);
console.log(dogJson);
// Output: '{"$type":"Dog","name":"Buddy","age":3,"breed":"Golden Retriever","isGoodBoy":true}'

const catJson = S7e.serialize(cat);
console.log(catJson);
// Output: '{"$type":"Cat","name":"Whiskers","age":2,"indoor":true,"livesLeft":9}'

// Polymorphic deserialization
const animals: Animal[] = S7e.deserializeArray(Animal, `[${dogJson},${catJson}]`);
console.log(animals[0] instanceof Dog); // true
console.log(animals[1] instanceof Cat); // true
```

### Custom Discriminator Property

You can customize the discriminator property name:

```typescript
// Set custom discriminator property
S7e.setDiscriminatorProperty('__type');

const dog = new Dog('Rex', 4, 'German Shepherd');
const json = S7e.serialize(dog);
console.log(json);
// Output: '{"__type":"Dog","name":"Rex","age":4,"breed":"German Shepherd","isGoodBoy":true}'
```

## Complex Nested Objects

S7E handles deeply nested object structures with ease.

### Nested Object Example

```typescript
@JsonClass({ name: 'Address' })
class Address {
  @JsonProperty({ name: 'street', type: String })
  public street: string;

  @JsonProperty({ name: 'city', type: String })
  public city: string;

  @JsonProperty({ name: 'country', type: String })
  public country: string;

  @JsonProperty({ name: 'coordinates', type: Coordinates, optional: true })
  public coordinates?: Coordinates;
}

@JsonClass({ name: 'Coordinates' })
class Coordinates {
  @JsonProperty({ name: 'latitude', type: Number })
  public latitude: number;

  @JsonProperty({ name: 'longitude', type: Number })
  public longitude: number;
}

@JsonClass({ name: 'Company' })
class Company {
  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'headquarters', type: Address })
  public headquarters: Address;

  @JsonProperty({ name: 'offices', type: [Address] })
  public offices: Address[];
}

@JsonClass({ name: 'Employee' })
class Employee {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'company', type: Company })
  public company: Company;

  @JsonProperty({ name: 'homeAddress', type: Address })
  public homeAddress: Address;
}
```

## Array Handling

S7E provides comprehensive support for arrays of various types.

### Arrays of Primitives

```typescript
@JsonClass({ name: 'Playlist' })
class Playlist {
  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'tags', type: [String] })
  public tags: string[];

  @JsonProperty({ name: 'ratings', type: [Number] })
  public ratings: number[];

  @JsonProperty({ name: 'featured', type: [Boolean] })
  public featured: boolean[];
}

const playlist = new Playlist();
playlist.name = 'My Favorites';
playlist.tags = ['rock', 'indie', 'alternative'];
playlist.ratings = [4.5, 3.8, 5.0, 4.2];
playlist.featured = [true, false, true, false];

const json = S7e.serialize(playlist);
// Handles arrays correctly in JSON
```

### Arrays of Objects

```typescript
@JsonClass({ name: 'Song' })
class Song {
  @JsonProperty({ name: 'title', type: String })
  public title: string;

  @JsonProperty({ name: 'artist', type: String })
  public artist: string;

  @JsonProperty({ name: 'duration', type: Number })
  public duration: number; // in seconds
}

@JsonClass({ name: 'Album' })
class Album {
  @JsonProperty({ name: 'title', type: String })
  public title: string;

  @JsonProperty({ name: 'artist', type: String })
  public artist: string;

  @JsonProperty({ name: 'songs', type: [Song] })
  public songs: Song[];

  @JsonProperty({ name: 'genres', type: [String] })
  public genres: string[];
}
```

## Custom Property Naming

Map class properties to different JSON property names for API compatibility.

### Snake Case to Camel Case

```typescript
@JsonClass({ name: 'ApiResponse' })
class ApiResponse {
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

  @JsonProperty({ name: 'is_active', type: Boolean })
  public isActive: boolean;
}

// Works with snake_case API responses
const apiJson = `{
  "user_id": 123,
  "first_name": "John",
  "last_name": "Doe",
  "email_address": "john.doe@example.com",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T12:30:00Z",
  "is_active": true
}`;

const user = S7e.deserialize(ApiResponse, apiJson);
console.log(user.firstName); // "John"
console.log(user.emailAddress); // "john.doe@example.com"
```

## Type Validation

S7E performs automatic type validation during deserialization.

### Built-in Type Validation

```typescript
@JsonClass({ name: 'StrictTypes' })
class StrictTypes {
  @JsonProperty({ name: 'stringValue', type: String })
  public stringValue: string;

  @JsonProperty({ name: 'numberValue', type: Number })
  public numberValue: number;

  @JsonProperty({ name: 'booleanValue', type: Boolean })
  public booleanValue: boolean;

  @JsonProperty({ name: 'dateValue', type: Date })
  public dateValue: Date;
}

// Valid JSON - will deserialize successfully
const validJson = `{
  "stringValue": "hello",
  "numberValue": 42,
  "booleanValue": true,
  "dateValue": "2025-01-29T00:00:00Z"
}`;

// Invalid JSON - will throw validation errors
const invalidJson = `{
  "stringValue": 123,
  "numberValue": "not a number",
  "booleanValue": "not a boolean",
  "dateValue": "invalid date"
}`;

try {
  const valid = S7e.deserialize(StrictTypes, validJson);
  console.log('Valid deserialization succeeded');
} catch (error) {
  console.log('Validation failed:', error.message);
}
```

### Custom Validation Logic

```typescript
@JsonClass({ name: 'ValidatedUser' })
class ValidatedUser {
  @JsonProperty({ name: 'email', type: String })
  public email: string;

  @JsonProperty({ name: 'age', type: Number })
  public age: number;

  public static fromJson(json: string): ValidatedUser {
    const user = S7e.deserialize(ValidatedUser, json);

    // Custom validation
    if (!user.email.includes('@')) {
      throw new Error('Invalid email format');
    }

    if (user.age < 0 || user.age > 150) {
      throw new Error('Invalid age range');
    }

    return user;
  }
}
```

## Metadata Registry Access

For advanced scenarios, you can access the metadata registry directly:

```typescript
import { MetadataRegistry } from 's7e';

// Check if a class is decorated
const isDecorated = MetadataRegistry.isJsonClass(User);

// Get class name
const className = MetadataRegistry.getClassName(User);

// Get property metadata
const properties = MetadataRegistry.getProperties(User);

// Get specific property options
const emailOptions = MetadataRegistry.getPropertyOptions(User, 'email');

// Register types programmatically
MetadataRegistry.registerType('CustomUser', User);

// Get registered type
const UserClass = MetadataRegistry.getRegisteredType('CustomUser');
```

## Performance Considerations

### Eager Metadata Loading

S7E uses eager metadata loading for optimal performance:

```typescript
// Metadata is loaded immediately when decorators are applied
@JsonClass({ name: 'FastClass' })
class FastClass {
  @JsonProperty({ name: 'data', type: String })
  public data: string;
}

// No metadata loading overhead during serialization/deserialization
const fast = new FastClass();
const json = S7e.serialize(fast); // Fast - metadata already loaded
```

### Batch Operations

For large datasets, use batch operations:

```typescript
// Efficient for large arrays
const largeArray = new Array(10000).fill(null).map((_, i) => new User(i, `User${i}`, `user${i}@example.com`));

// Serialize large array efficiently
const jsonArray = S7e.serializeArray(largeArray);

// Deserialize large array efficiently
const deserializedArray = S7e.deserializeArray(User, jsonArray);
```

## Error Handling Best Practices

```typescript
function safeSerialize<T>(obj: T): string | null {
  try {
    return S7e.serialize(obj);
  } catch (error) {
    console.error('Serialization failed:', error);
    return null;
  }
}

function safeDeserialize<T>(type: new () => T, json: string): T | null {
  try {
    return S7e.deserialize(type, json);
  } catch (error) {
    console.error('Deserialization failed:', error);
    return null;
  }
}

function safeDeserializeArray<T>(type: new () => T, json: string): T[] {
  try {
    return S7e.deserializeArray(type, json);
  } catch (error) {
    console.error('Array deserialization failed:', error);
    return [];
  }
}
```

## Next Steps

Now that you've mastered the advanced features, explore:

- [API Reference](/api/decorators) - Complete documentation of all decorators and methods
- [Practical Examples](/examples/basic-usage) - Real-world usage scenarios
- [Type Definitions](/api/types) - Complete type reference

Ready to see real-world examples? Check out our [examples section](/examples/basic-usage)!
