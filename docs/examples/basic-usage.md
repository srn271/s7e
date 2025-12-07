# Basic Usage Examples

This page provides practical examples of using S7E for common serialization scenarios. Each example includes complete code that you can copy and use in your projects.

## Simple User Management

A basic example showing user creation, serialization, and deserialization.

```typescript
import { S7e, JsonClass, JsonProperty } from 's7e';

@JsonClass({ name: 'User' })
class User {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'username', type: String })
  public username: string;

  @JsonProperty({ name: 'email', type: String })
  public email: string;

  @JsonProperty({ name: 'isActive', type: Boolean })
  public isActive: boolean;

  @JsonProperty({ name: 'createdAt', type: Date })
  public createdAt: Date;

  // Non-serialized properties
  private password: string;
  private lastLoginAttempt: Date;

  constructor(id: number, username: string, email: string) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.isActive = true;
    this.createdAt = new Date();
    this.password = '';
    this.lastLoginAttempt = new Date();
  }

  // Helper method for creating users
  public static create(username: string, email: string): User {
    const id = Math.floor(Math.random() * 10000);
    return new User(id, username, email);
  }

  // Safe deserialization with validation
  public static fromJson(json: string | Record<string, unknown>): User {
    const user = S7e.deserialize(json, User);

    if (!user.email.includes('@')) {
      throw new Error('Invalid email format');
    }

    return user;
  }
}

// Usage examples
const user = User.create('john_doe', 'john@example.com');
console.log('Original user:', user);

// Serialize to object
const obj = S7e.serialize(user);
console.log('Object:', obj);
// Output: {$type:"User",id:1234,username:"john_doe",email:"john@example.com",isActive:true,createdAt:"2025-01-29T10:00:00Z"}

// Convert to JSON string if needed
const jsonString = JSON.stringify(obj);

// Deserialize from object or JSON string
const deserializedUser = User.fromJson(obj); // or User.fromJson(jsonString)
console.log('Deserialized user:', deserializedUser);
console.log('Instance check:', deserializedUser instanceof User); // true

// Working with arrays
const users = [
  User.create('alice', 'alice@example.com'),
  User.create('bob', 'bob@example.com'),
  User.create('carol', 'carol@example.com')
];

// Array serialization is built-in
const usersArray = S7e.serialize(users);
console.log('Users array:', usersArray);

const deserializedUsers = S7e.deserialize(usersArray, [User]);
console.log('Deserialized users count:', deserializedUsers.length);
console.log('All are User instances:', deserializedUsers.every(u => u instanceof User));
```

## Product Catalog

An e-commerce example with products, categories, and pricing.

```typescript
import { S7e, JsonClass, JsonProperty } from 's7e';

@JsonClass({ name: 'Category' })
class Category {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'description', type: String, optional: true })
  public description?: string;

  constructor(id: number, name: string, description?: string) {
    this.id = id;
    this.name = name;
    this.description = description;
  }
}

@JsonClass({ name: 'Price' })
class Price {
  @JsonProperty({ name: 'amount', type: Number })
  public amount: number;

  @JsonProperty({ name: 'currency', type: String })
  public currency: string;

  @JsonProperty({ name: 'validFrom', type: Date })
  public validFrom: Date;

  @JsonProperty({ name: 'validTo', type: Date, optional: true })
  public validTo?: Date;

  constructor(amount: number, currency: string = 'USD') {
    this.amount = amount;
    this.currency = currency;
    this.validFrom = new Date();
  }

  public isValid(date: Date = new Date()): boolean {
    if (date < this.validFrom) return false;
    if (this.validTo && date > this.validTo) return false;
    return true;
  }
}

@JsonClass({ name: 'Product' })
class Product {
  @JsonProperty({ name: 'id', type: String })
  public id: string;

  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'description', type: String })
  public description: string;

  @JsonProperty({ name: 'category', type: Category })
  public category: Category;

  @JsonProperty({ name: 'price', type: Price })
  public price: Price;

  @JsonProperty({ name: 'tags', type: [String] })
  public tags: string[];

  @JsonProperty({ name: 'inStock', type: Boolean })
  public inStock: boolean;

  @JsonProperty({ name: 'stockQuantity', type: Number })
  public stockQuantity: number;

  constructor(
    id: string,
    name: string,
    description: string,
    category: Category,
    price: Price
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.category = category;
    this.price = price;
    this.tags = [];
    this.inStock = true;
    this.stockQuantity = 0;
  }

  public addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  public setStock(quantity: number): void {
    this.stockQuantity = quantity;
    this.inStock = quantity > 0;
  }
}

// Usage
const electronicsCategory = new Category(1, 'Electronics', 'Electronic devices and gadgets');
const laptopPrice = new Price(999.99, 'USD');

const laptop = new Product(
  'laptop-001',
  'Gaming Laptop',
  'High-performance laptop for gaming',
  electronicsCategory,
  laptopPrice
);

laptop.addTag('gaming');
laptop.addTag('laptop');
laptop.addTag('electronics');
laptop.setStock(15);

// Serialize the product
const productJson = S7e.serialize(laptop);
console.log('Product JSON:', productJson);

// Deserialize the product
const deserializedProduct = S7e.deserialize(Product, productJson);
console.log('Product name:', deserializedProduct.name);
console.log('Category:', deserializedProduct.category.name);
console.log('Price valid:', deserializedProduct.price.isValid());
console.log('Tags:', deserializedProduct.tags.join(', '));

// Product catalog
const products = [laptop];
const catalogJson = S7e.serializeArray(products);
const deserializedCatalog = S7e.deserializeArray(Product, catalogJson);
```

## API Response Handling

Example showing how to handle API responses with different data structures.

```typescript
import { S7e, JsonClass, JsonProperty } from 's7e';

@JsonClass({ name: 'ApiError' })
class ApiError {
  @JsonProperty({ name: 'code', type: String })
  public code: string;

  @JsonProperty({ name: 'message', type: String })
  public message: string;

  @JsonProperty({ name: 'details', type: String, optional: true })
  public details?: string;

  constructor(code: string, message: string, details?: string) {
    this.code = code;
    this.message = message;
    this.details = details;
  }
}

@JsonClass({ name: 'ApiResponse' })
class ApiResponse<T> {
  @JsonProperty({ name: 'success', type: Boolean })
  public success: boolean;

  @JsonProperty({ name: 'timestamp', type: Date })
  public timestamp: Date;

  @JsonProperty({ name: 'data', type: Object, optional: true })
  public data?: T;

  @JsonProperty({ name: 'error', type: ApiError, optional: true })
  public error?: ApiError;

  @JsonProperty({ name: 'metadata', type: Object, optional: true })
  public metadata?: Record<string, unknown>;

  constructor(success: boolean) {
    this.success = success;
    this.timestamp = new Date();
  }

  public static success<T>(data: T, metadata?: Record<string, unknown>): ApiResponse<T> {
    const response = new ApiResponse<T>(true);
    response.data = data;
    response.metadata = metadata;
    return response;
  }

  public static error<T>(error: ApiError): ApiResponse<T> {
    const response = new ApiResponse<T>(false);
    response.error = error;
    return response;
  }
}

@JsonClass({ name: 'UserProfile' })
class UserProfile {
  @JsonProperty({ name: 'user_id', type: Number })
  public userId: number;

  @JsonProperty({ name: 'display_name', type: String })
  public displayName: string;

  @JsonProperty({ name: 'avatar_url', type: String, optional: true })
  public avatarUrl?: string;

  @JsonProperty({ name: 'bio', type: String, optional: true })
  public bio?: string;

  @JsonProperty({ name: 'followers_count', type: Number })
  public followersCount: number;

  @JsonProperty({ name: 'following_count', type: Number })
  public followingCount: number;

  constructor(userId: number, displayName: string) {
    this.userId = userId;
    this.displayName = displayName;
    this.followersCount = 0;
    this.followingCount = 0;
  }
}

// API Client example
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getUserProfile(userId: number): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`);
      const jsonText = await response.text();

      if (!response.ok) {
        const errorResponse = S7e.deserialize(ApiResponse, jsonText) as ApiResponse<null>;
        throw new Error(errorResponse.error?.message || 'API request failed');
      }

      const apiResponse = S7e.deserialize(ApiResponse, jsonText) as ApiResponse<UserProfile>;

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error?.message || 'No user data received');
      }

      // Deserialize the nested user profile data
      const userProfileJson = JSON.stringify(apiResponse.data);
      return S7e.deserialize(UserProfile, userProfileJson);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
    const profileJson = S7e.serialize(profile);

    try {
      const response = await fetch(`${this.baseUrl}/users/${profile.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: profileJson,
      });

      const jsonText = await response.text();
      const apiResponse = S7e.deserialize(ApiResponse, jsonText) as ApiResponse<UserProfile>;

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error?.message || 'Update failed');
      }

      const updatedProfileJson = JSON.stringify(apiResponse.data);
      return S7e.deserialize(UserProfile, updatedProfileJson);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }
}

// Usage example
async function exampleUsage() {
  const client = new ApiClient('https://api.example.com');

  try {
    // Fetch user profile
    const profile = await client.getUserProfile(123);
    console.log('User profile:', profile.displayName);
    console.log('Followers:', profile.followersCount);

    // Update profile
    profile.bio = 'Updated bio text';
    const updatedProfile = await client.updateUserProfile(profile);
    console.log('Profile updated successfully');
  } catch (error) {
    console.error('API operation failed:', error);
  }
}
```

## Configuration Management

Example showing how to use S7E for application configuration with validation.

```typescript
import { S7e, JsonClass, JsonProperty } from 's7e';

@JsonClass({ name: 'DatabaseConfig' })
class DatabaseConfig {
  @JsonProperty({ name: 'host', type: String })
  public host: string;

  @JsonProperty({ name: 'port', type: Number })
  public port: number;

  @JsonProperty({ name: 'database', type: String })
  public database: string;

  @JsonProperty({ name: 'username', type: String })
  public username: string;

  @JsonProperty({ name: 'password', type: String })
  public password: string;

  @JsonProperty({ name: 'ssl', type: Boolean })
  public ssl: boolean;

  @JsonProperty({ name: 'poolSize', type: Number, optional: true })
  public poolSize?: number;

  @JsonProperty({ name: 'timeout', type: Number, optional: true })
  public timeout?: number;

  constructor() {
    this.host = 'localhost';
    this.port = 5432;
    this.database = '';
    this.username = '';
    this.password = '';
    this.ssl = false;
    this.poolSize = 10;
    this.timeout = 30000;
  }

  public validate(): void {
    if (!this.host) throw new Error('Database host is required');
    if (!this.database) throw new Error('Database name is required');
    if (!this.username) throw new Error('Database username is required');
    if (this.port < 1 || this.port > 65535) throw new Error('Invalid port number');
  }

  public getConnectionString(): string {
    const protocol = this.ssl ? 'postgresql+ssl' : 'postgresql';
    return `${protocol}://${this.username}:${this.password}@${this.host}:${this.port}/${this.database}`;
  }
}

@JsonClass({ name: 'ApiConfig' })
class ApiConfig {
  @JsonProperty({ name: 'baseUrl', type: String })
  public baseUrl: string;

  @JsonProperty({ name: 'timeout', type: Number })
  public timeout: number;

  @JsonProperty({ name: 'retries', type: Number })
  public retries: number;

  @JsonProperty({ name: 'apiKey', type: String, optional: true })
  public apiKey?: string;

  @JsonProperty({ name: 'rateLimitPerSecond', type: Number, optional: true })
  public rateLimitPerSecond?: number;

  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.timeout = 5000;
    this.retries = 3;
    this.rateLimitPerSecond = 100;
  }

  public validate(): void {
    if (!this.baseUrl) throw new Error('API base URL is required');
    if (this.timeout < 1000) throw new Error('Timeout must be at least 1000ms');
    if (this.retries < 0) throw new Error('Retries cannot be negative');
  }
}

@JsonClass({ name: 'LoggingConfig' })
class LoggingConfig {
  @JsonProperty({ name: 'level', type: String })
  public level: string;

  @JsonProperty({ name: 'enableConsole', type: Boolean })
  public enableConsole: boolean;

  @JsonProperty({ name: 'enableFile', type: Boolean })
  public enableFile: boolean;

  @JsonProperty({ name: 'filePath', type: String, optional: true })
  public filePath?: string;

  @JsonProperty({ name: 'maxFileSize', type: String, optional: true })
  public maxFileSize?: string;

  @JsonProperty({ name: 'maxFiles', type: Number, optional: true })
  public maxFiles?: number;

  constructor() {
    this.level = 'info';
    this.enableConsole = true;
    this.enableFile = false;
    this.maxFileSize = '10MB';
    this.maxFiles = 5;
  }

  public validate(): void {
    const validLevels = ['error', 'warn', 'info', 'debug'];
    if (!validLevels.includes(this.level)) {
      throw new Error(`Invalid log level. Must be one of: ${validLevels.join(', ')}`);
    }

    if (this.enableFile && !this.filePath) {
      throw new Error('File path is required when file logging is enabled');
    }
  }
}

@JsonClass({ name: 'AppConfig' })
class AppConfig {
  @JsonProperty({ name: 'environment', type: String })
  public environment: string;

  @JsonProperty({ name: 'port', type: Number })
  public port: number;

  @JsonProperty({ name: 'database', type: DatabaseConfig })
  public database: DatabaseConfig;

  @JsonProperty({ name: 'api', type: ApiConfig })
  public api: ApiConfig;

  @JsonProperty({ name: 'logging', type: LoggingConfig })
  public logging: LoggingConfig;

  @JsonProperty({ name: 'features', type: [String] })
  public features: string[];

  @JsonProperty({ name: 'debug', type: Boolean })
  public debug: boolean;

  constructor() {
    this.environment = 'development';
    this.port = 3000;
    this.database = new DatabaseConfig();
    this.api = new ApiConfig();
    this.logging = new LoggingConfig();
    this.features = [];
    this.debug = false;
  }

  public validate(): void {
    const validEnvironments = ['development', 'staging', 'production'];
    if (!validEnvironments.includes(this.environment)) {
      throw new Error(`Invalid environment. Must be one of: ${validEnvironments.join(', ')}`);
    }

    if (this.port < 1 || this.port > 65535) {
      throw new Error('Invalid port number');
    }

    this.database.validate();
    this.api.validate();
    this.logging.validate();
  }

  public static fromFile(filePath: string): AppConfig {
    try {
      const fs = require('fs');
      const configJson = fs.readFileSync(filePath, 'utf8');
      const config = S7e.deserialize(AppConfig, configJson);
      config.validate();
      return config;
    } catch (error) {
      throw new Error(`Failed to load configuration from ${filePath}: ${error.message}`);
    }
  }

  public saveToFile(filePath: string): void {
    try {
      this.validate();
      const fs = require('fs');
      const configJson = S7e.serialize(this);
      const formatted = JSON.stringify(JSON.parse(configJson), null, 2);
      fs.writeFileSync(filePath, formatted, 'utf8');
    } catch (error) {
      throw new Error(`Failed to save configuration to ${filePath}: ${error.message}`);
    }
  }

  public isDevelopment(): boolean {
    return this.environment === 'development';
  }

  public isProduction(): boolean {
    return this.environment === 'production';
  }
}

// Usage example
function configurationExample() {
  // Create default configuration
  const config = new AppConfig();
  config.database.host = 'prod-db.example.com';
  config.database.database = 'myapp';
  config.database.username = 'myapp_user';
  config.database.password = 'secure_password';
  config.database.ssl = true;

  config.api.baseUrl = 'https://api.example.com';
  config.api.apiKey = 'your-api-key';

  config.logging.level = 'warn';
  config.logging.enableFile = true;
  config.logging.filePath = '/var/log/myapp.log';

  config.features = ['feature1', 'feature2', 'experimental'];
  config.environment = 'production';
  config.port = 8080;

  try {
    // Validate configuration
    config.validate();
    console.log('Configuration is valid');

    // Serialize to JSON
    const configJson = S7e.serialize(config);
    console.log('Serialized config length:', configJson.length);

    // Save to file (Node.js only)
    // config.saveToFile('./config.json');

    // Load from JSON
    const loadedConfig = S7e.deserialize(AppConfig, configJson);
    console.log('Loaded environment:', loadedConfig.environment);
    console.log('Database connection:', loadedConfig.database.getConnectionString());
    console.log('Is production:', loadedConfig.isProduction());

  } catch (error) {
    console.error('Configuration error:', error.message);
  }
}

// Run the example
configurationExample();
```

## Next Steps

These examples show common patterns for using S7E in real applications. For more advanced scenarios, check out:

- [Complex Objects](/examples/complex-objects) - Nested objects and inheritance
- [Array Handling](/examples/arrays) - Working with arrays and collections
- [Optional Properties](/examples/optional-properties) - Handling optional and nullable data
- [Custom Naming](/examples/custom-naming) - API compatibility and naming conventions
- [Type Validation](/examples/type-validation) - Advanced validation patterns
