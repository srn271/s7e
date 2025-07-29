# Type Validation

S7E provides robust type validation during serialization and deserialization. This guide demonstrates validation patterns, error handling, and best practices for ensuring data integrity.

## Basic Type Validation

Understanding how S7E validates types automatically during deserialization.

```typescript
import { S7e, JsonClass, JsonProperty } from 's7e';

@JsonClass({ name: 'User' })
class User {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'email', type: String })
  public email: string;

  @JsonProperty({ name: 'isActive', type: Boolean })
  public isActive: boolean;

  @JsonProperty({ name: 'createdAt', type: Date })
  public createdAt: Date;

  @JsonProperty({ name: 'score', type: Number, optional: true })
  public score?: number;

  @JsonProperty({ name: 'tags', type: [String], optional: true })
  public tags?: string[];

  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.isActive = true;
    this.createdAt = new Date();
  }

  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Custom validation beyond type checking
    if (this.id <= 0) {
      errors.push('ID must be a positive number');
    }

    if (!this.name.trim()) {
      errors.push('Name cannot be empty');
    }

    if (!this.email.includes('@')) {
      errors.push('Email must contain @ symbol');
    }

    if (this.score !== undefined && (this.score < 0 || this.score > 100)) {
      errors.push('Score must be between 0 and 100');
    }

    return { valid: errors.length === 0, errors };
  }
}

// Test basic type validation

console.log('=== Basic Type Validation ===\\n');

// Valid data
const validUserJson = `{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "isActive": true,
  "createdAt": "2023-01-15T10:30:00.000Z",
  "score": 85,
  "tags": ["developer", "typescript"]
}`;

try {
  const validUser = S7e.deserialize(User, validUserJson);
  console.log('Valid User Deserialization:');
  console.log(`Name: ${validUser.name}`);
  console.log(`Email: ${validUser.email}`);
  console.log(`ID type: ${typeof validUser.id}`);
  console.log(`IsActive type: ${typeof validUser.isActive}`);
  console.log(`CreatedAt type: ${validUser.createdAt.constructor.name}`);
  console.log(`Score: ${validUser.score}`);
  console.log(`Tags: ${validUser.tags?.join(', ')}`);
  console.log(`Custom validation: ${JSON.stringify(validUser.validate())}\\n`);
} catch (error) {
  console.error('Unexpected error with valid data:', error);
}

// Test type validation errors
const invalidDataSets = [
  {
    name: 'Invalid ID (string instead of number)',
    json: `{
      "id": "not-a-number",
      "name": "John Doe",
      "email": "john@example.com",
      "isActive": true,
      "createdAt": "2023-01-15T10:30:00.000Z"
    }`
  },
  {
    name: 'Invalid boolean (string instead of boolean)',
    json: `{
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com",
      "isActive": "true",
      "createdAt": "2023-01-15T10:30:00.000Z"
    }`
  },
  {
    name: 'Invalid date format',
    json: `{
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com",
      "isActive": true,
      "createdAt": "not-a-date"
    }`
  },
  {
    name: 'Invalid array type (number instead of string array)',
    json: `{
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com",
      "isActive": true,
      "createdAt": "2023-01-15T10:30:00.000Z",
      "tags": [1, 2, 3]
    }`
  }
];

invalidDataSets.forEach(({ name, json }) => {
  console.log(`Testing: ${name}`);
  try {
    const user = S7e.deserialize(User, json);
    console.log('  ❌ Expected validation error but deserialization succeeded');
    console.log(`  Result: ${user.name}`);
  } catch (error) {
    console.log(`  ✅ Validation error caught: ${error.message}`);
  }
  console.log('');
});
```

## Custom Validation with Nested Objects

Implementing validation for complex nested structures.

```typescript
@JsonClass({ name: 'Address' })
class Address {
  @JsonProperty({ name: 'street', type: String })
  public street: string;

  @JsonProperty({ name: 'city', type: String })
  public city: string;

  @JsonProperty({ name: 'zipCode', type: String })
  public zipCode: string;

  @JsonProperty({ name: 'country', type: String })
  public country: string;

  constructor(street: string, city: string, zipCode: string, country: string = 'US') {
    this.street = street;
    this.city = city;
    this.zipCode = zipCode;
    this.country = country;
  }

  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.street.trim()) {
      errors.push('Street address is required');
    }

    if (!this.city.trim()) {
      errors.push('City is required');
    }

    // US ZIP code validation
    if (this.country === 'US') {
      const zipRegex = /^\\d{5}(-\\d{4})?$/;
      if (!zipRegex.test(this.zipCode)) {
        errors.push('Invalid US ZIP code format (should be 12345 or 12345-6789)');
      }
    }

    // Basic country code validation
    const validCountries = ['US', 'CA', 'UK', 'DE', 'FR', 'JP', 'AU'];
    if (!validCountries.includes(this.country)) {
      errors.push(`Unsupported country code: ${this.country}`);
    }

    return { valid: errors.length === 0, errors };
  }
}

@JsonClass({ name: 'ContactInfo' })
class ContactInfo {
  @JsonProperty({ name: 'email', type: String })
  public email: string;

  @JsonProperty({ name: 'phone', type: String, optional: true })
  public phone?: string;

  @JsonProperty({ name: 'website', type: String, optional: true })
  public website?: string;

  constructor(email: string) {
    this.email = email;
  }

  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Email validation
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(this.email)) {
      errors.push('Invalid email format');
    }

    // Phone validation (if provided)
    if (this.phone) {
      const phoneRegex = /^\\+?[1-9]\\d{1,14}$/; // E.164 format
      if (!phoneRegex.test(this.phone.replace(/[\\s\\-\\(\\)]/g, ''))) {
        errors.push('Invalid phone number format');
      }
    }

    // Website validation (if provided)
    if (this.website) {
      try {
        new URL(this.website);
      } catch {
        errors.push('Invalid website URL format');
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

@JsonClass({ name: 'Person' })
class Person {
  @JsonProperty({ name: 'id', type: String })
  public id: string;

  @JsonProperty({ name: 'firstName', type: String })
  public firstName: string;

  @JsonProperty({ name: 'lastName', type: String })
  public lastName: string;

  @JsonProperty({ name: 'age', type: Number })
  public age: number;

  @JsonProperty({ name: 'address', type: Address })
  public address: Address;

  @JsonProperty({ name: 'contact', type: ContactInfo })
  public contact: ContactInfo;

  @JsonProperty({ name: 'emergencyContacts', type: [ContactInfo], optional: true })
  public emergencyContacts?: ContactInfo[];

  @JsonProperty({ name: 'preferredLanguages', type: [String] })
  public preferredLanguages: string[];

  @JsonProperty({ name: 'metadata', type: Object, optional: true })
  public metadata?: {
    createdBy: string;
    createdAt: Date;
    lastModified: Date;
    version: number;
  };

  constructor(
    id: string,
    firstName: string,
    lastName: string,
    age: number,
    address: Address,
    contact: ContactInfo
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.age = age;
    this.address = address;
    this.contact = contact;
    this.preferredLanguages = ['en'];
  }

  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // ID validation
    if (!this.id.trim()) {
      errors.push('ID is required');
    }

    // Name validation
    if (!this.firstName.trim()) {
      errors.push('First name is required');
    }

    if (!this.lastName.trim()) {
      errors.push('Last name is required');
    }

    // Age validation
    if (this.age < 0 || this.age > 150) {
      errors.push('Age must be between 0 and 150');
    }

    // Validate nested objects
    const addressValidation = this.address.validate();
    if (!addressValidation.valid) {
      errors.push(...addressValidation.errors.map(e => `Address: ${e}`));
    }

    const contactValidation = this.contact.validate();
    if (!contactValidation.valid) {
      errors.push(...contactValidation.errors.map(e => `Contact: ${e}`));
    }

    // Validate emergency contacts if present
    if (this.emergencyContacts) {
      this.emergencyContacts.forEach((contact, index) => {
        const validation = contact.validate();
        if (!validation.valid) {
          errors.push(...validation.errors.map(e => `Emergency Contact ${index + 1}: ${e}`));
        }
      });
    }

    // Language validation
    const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'];
    const invalidLanguages = this.preferredLanguages.filter(lang => !validLanguages.includes(lang));
    if (invalidLanguages.length > 0) {
      errors.push(`Invalid language codes: ${invalidLanguages.join(', ')}`);
    }

    // Metadata validation (if present)
    if (this.metadata) {
      if (!this.metadata.createdBy.trim()) {
        errors.push('Metadata: createdBy is required');
      }
      if (this.metadata.version < 1) {
        errors.push('Metadata: version must be at least 1');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public addEmergencyContact(contact: ContactInfo): void {
    if (!this.emergencyContacts) {
      this.emergencyContacts = [];
    }
    this.emergencyContacts.push(contact);
  }

  public setMetadata(createdBy: string, version: number = 1): void {
    this.metadata = {
      createdBy,
      createdAt: new Date(),
      lastModified: new Date(),
      version
    };
  }
}

// Test complex validation scenarios

console.log('=== Complex Nested Validation ===\\n');

// Create valid nested objects
const validAddress = new Address('123 Main St', 'Springfield', '12345', 'US');
const validContact = new ContactInfo('john@example.com');
validContact.phone = '+1-555-0123';
validContact.website = 'https://johndoe.com';

const validPerson = new Person('P001', 'John', 'Doe', 30, validAddress, validContact);
validPerson.preferredLanguages = ['en', 'es'];

const emergencyContact = new ContactInfo('jane@example.com');
emergencyContact.phone = '+1-555-0124';
validPerson.addEmergencyContact(emergencyContact);

validPerson.setMetadata('admin', 1);

console.log('Valid Person:');
console.log(`Name: ${validPerson.getFullName()}`);
const validation = validPerson.validate();
console.log(`Validation: ${validation.valid ? '✅ Valid' : '❌ Invalid'}`);
if (!validation.valid) {
  validation.errors.forEach(error => console.log(`  - ${error}`));
}

// Serialize and test round-trip validation
const personJson = S7e.serialize(validPerson);
console.log(`\\nSerialized person (${(personJson.length / 1024).toFixed(2)} KB)`);

const deserializedPerson = S7e.deserialize(Person, personJson);
const deserializedValidation = deserializedPerson.validate();
console.log(`Deserialized validation: ${deserializedValidation.valid ? '✅ Valid' : '❌ Invalid'}`);

// Test invalid nested data
console.log('\\n=== Invalid Nested Data Tests ===\\n');

const invalidPersonData = [
  {
    name: 'Invalid address ZIP code',
    json: `{
      "id": "P002",
      "firstName": "Jane",
      "lastName": "Smith",
      "age": 25,
      "address": {
        "street": "456 Oak Ave",
        "city": "Chicago",
        "zipCode": "invalid-zip",
        "country": "US"
      },
      "contact": {
        "email": "jane@example.com"
      },
      "preferredLanguages": ["en"]
    }`
  },
  {
    name: 'Invalid contact email',
    json: `{
      "id": "P003",
      "firstName": "Bob",
      "lastName": "Johnson",
      "age": 35,
      "address": {
        "street": "789 Pine St",
        "city": "Seattle",
        "zipCode": "98101",
        "country": "US"
      },
      "contact": {
        "email": "not-an-email"
      },
      "preferredLanguages": ["en"]
    }`
  },
  {
    name: 'Invalid age and language',
    json: `{
      "id": "P004",
      "firstName": "Alice",
      "lastName": "Brown",
      "age": 200,
      "address": {
        "street": "321 Elm St",
        "city": "Portland",
        "zipCode": "97201",
        "country": "US"
      },
      "contact": {
        "email": "alice@example.com"
      },
      "preferredLanguages": ["invalid-lang", "another-invalid"]
    }`
  }
];

invalidPersonData.forEach(({ name, json }) => {
  console.log(`Testing: ${name}`);
  try {
    const person = S7e.deserialize(Person, json);
    const validation = person.validate();

    if (validation.valid) {
      console.log('  ❌ Expected validation errors but validation passed');
    } else {
      console.log('  ✅ Validation correctly identified issues:');
      validation.errors.forEach(error => console.log(`    - ${error}`));
    }
  } catch (error) {
    console.log(`  ⚠️ Type validation error during deserialization: ${error.message}`);
  }
  console.log('');
});
```

## Advanced Validation Patterns

Implementing sophisticated validation logic with cross-field validation and conditional rules.

```typescript
// Enumeration support
enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  GUEST = 'guest'
}

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

@JsonClass({ name: 'UserAccount' })
class UserAccount {
  @JsonProperty({ name: 'id', type: String })
  public id: string;

  @JsonProperty({ name: 'username', type: String })
  public username: string;

  @JsonProperty({ name: 'email', type: String })
  public email: string;

  @JsonProperty({ name: 'role', type: String })
  public role: UserRole;

  @JsonProperty({ name: 'status', type: String })
  public status: UserStatus;

  @JsonProperty({ name: 'createdAt', type: Date })
  public createdAt: Date;

  @JsonProperty({ name: 'lastLoginAt', type: Date, optional: true })
  public lastLoginAt?: Date;

  @JsonProperty({ name: 'loginAttempts', type: Number })
  public loginAttempts: number;

  @JsonProperty({ name: 'isEmailVerified', type: Boolean })
  public isEmailVerified: boolean;

  @JsonProperty({ name: 'permissions', type: [String] })
  public permissions: string[];

  @JsonProperty({ name: 'profile', type: Object, optional: true })
  public profile?: {
    displayName: string;
    bio: string;
    avatarUrl: string;
    birthDate: Date;
    phoneNumber: string;
  };

  @JsonProperty({ name: 'settings', type: Object })
  public settings: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisible: boolean;
      emailVisible: boolean;
      allowDirectMessages: boolean;
    };
  };

  @JsonProperty({ name: 'subscription', type: Object, optional: true })
  public subscription?: {
    plan: 'free' | 'premium' | 'enterprise';
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
    billingCycle: 'monthly' | 'yearly';
  };

  constructor(id: string, username: string, email: string, role: UserRole = UserRole.USER) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.role = role;
    this.status = UserStatus.PENDING;
    this.createdAt = new Date();
    this.loginAttempts = 0;
    this.isEmailVerified = false;
    this.permissions = this.getDefaultPermissions(role);
    this.settings = {
      theme: 'auto',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        profileVisible: true,
        emailVisible: false,
        allowDirectMessages: true
      }
    };
  }

  private getDefaultPermissions(role: UserRole): string[] {
    switch (role) {
      case UserRole.ADMIN:
        return ['read', 'write', 'delete', 'admin', 'moderate'];
      case UserRole.MODERATOR:
        return ['read', 'write', 'moderate'];
      case UserRole.USER:
        return ['read', 'write'];
      case UserRole.GUEST:
        return ['read'];
      default:
        return ['read'];
    }
  }

  public validate(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic field validation
    if (!this.id.trim()) {
      errors.push('ID is required');
    }

    if (!this.username.trim()) {
      errors.push('Username is required');
    } else {
      // Username format validation
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(this.username)) {
        errors.push('Username must be 3-20 characters and contain only letters, numbers, and underscores');
      }
    }

    // Email validation
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(this.email)) {
      errors.push('Invalid email format');
    }

    // Enum validation
    if (!Object.values(UserRole).includes(this.role)) {
      errors.push(`Invalid role: ${this.role}`);
    }

    if (!Object.values(UserStatus).includes(this.status)) {
      errors.push(`Invalid status: ${this.status}`);
    }

    // Cross-field validation
    if (this.status === UserStatus.ACTIVE && !this.isEmailVerified) {
      errors.push('Active users must have verified email addresses');
    }

    if (this.status === UserStatus.SUSPENDED && this.loginAttempts === 0) {
      warnings.push('Suspended users typically have failed login attempts');
    }

    if (this.lastLoginAt && this.lastLoginAt > new Date()) {
      errors.push('Last login date cannot be in the future');
    }

    if (this.loginAttempts < 0 || this.loginAttempts > 100) {
      errors.push('Login attempts must be between 0 and 100');
    }

    // Permission validation
    const validPermissions = ['read', 'write', 'delete', 'admin', 'moderate'];
    const invalidPermissions = this.permissions.filter(p => !validPermissions.includes(p));
    if (invalidPermissions.length > 0) {
      errors.push(`Invalid permissions: ${invalidPermissions.join(', ')}`);
    }

    // Role-permission consistency
    const defaultPermissions = this.getDefaultPermissions(this.role);
    const missingPermissions = defaultPermissions.filter(p => !this.permissions.includes(p));
    if (missingPermissions.length > 0) {
      warnings.push(`Missing expected permissions for ${this.role}: ${missingPermissions.join(', ')}`);
    }

    // Profile validation (if present)
    if (this.profile) {
      if (!this.profile.displayName.trim()) {
        errors.push('Profile display name is required when profile is provided');
      }

      if (this.profile.birthDate > new Date()) {
        errors.push('Birth date cannot be in the future');
      }

      // Age validation
      const age = this.calculateAge(this.profile.birthDate);
      if (age < 13) {
        errors.push('Users must be at least 13 years old');
      }

      if (this.profile.phoneNumber) {
        const phoneRegex = /^\\+?[1-9]\\d{1,14}$/;
        if (!phoneRegex.test(this.profile.phoneNumber.replace(/[\\s\\-\\(\\)]/g, ''))) {
          errors.push('Invalid phone number format in profile');
        }
      }
    }

    // Settings validation
    const validThemes = ['light', 'dark', 'auto'];
    if (!validThemes.includes(this.settings.theme)) {
      errors.push(`Invalid theme: ${this.settings.theme}`);
    }

    const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'];
    if (!validLanguages.includes(this.settings.language)) {
      errors.push(`Unsupported language: ${this.settings.language}`);
    }

    // Subscription validation (if present)
    if (this.subscription) {
      const validPlans = ['free', 'premium', 'enterprise'];
      if (!validPlans.includes(this.subscription.plan)) {
        errors.push(`Invalid subscription plan: ${this.subscription.plan}`);
      }

      if (this.subscription.startDate > this.subscription.endDate) {
        errors.push('Subscription start date must be before end date');
      }

      const validBillingCycles = ['monthly', 'yearly'];
      if (!validBillingCycles.includes(this.subscription.billingCycle)) {
        errors.push(`Invalid billing cycle: ${this.subscription.billingCycle}`);
      }

      // Subscription vs role consistency
      if (this.subscription.plan === 'free' && this.role === UserRole.ADMIN) {
        warnings.push('Admin users typically have premium subscriptions');
      }
    }

    // Business logic validation
    if (this.role === UserRole.GUEST && this.permissions.some(p => ['write', 'delete', 'admin', 'moderate'].includes(p))) {
      errors.push('Guest users should not have write, delete, admin, or moderate permissions');
    }

    if (this.status === UserStatus.INACTIVE) {
      const daysSinceLastLogin = this.lastLoginAt ?
        (Date.now() - this.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24) :
        (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLastLogin < 30) {
        warnings.push('Users marked as inactive typically have not logged in for 30+ days');
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  public updateRole(newRole: UserRole): void {
    this.role = newRole;
    this.permissions = this.getDefaultPermissions(newRole);
  }

  public activate(): void {
    if (!this.isEmailVerified) {
      throw new Error('Cannot activate user without email verification');
    }
    this.status = UserStatus.ACTIVE;
  }

  public suspend(): void {
    this.status = UserStatus.SUSPENDED;
  }

  public recordLoginAttempt(success: boolean): void {
    if (success) {
      this.loginAttempts = 0;
      this.lastLoginAt = new Date();
    } else {
      this.loginAttempts++;
      if (this.loginAttempts >= 5) {
        this.suspend();
      }
    }
  }
}

// Test advanced validation patterns

console.log('=== Advanced Validation Patterns ===\\n');

// Create a valid user
const user = new UserAccount('U001', 'john_doe', 'john@example.com', UserRole.USER);
user.isEmailVerified = true;
user.activate();

user.profile = {
  displayName: 'John Doe',
  bio: 'Software developer passionate about TypeScript',
  avatarUrl: 'https://example.com/avatar.jpg',
  birthDate: new Date('1990-05-15'),
  phoneNumber: '+1-555-0123'
};

user.subscription = {
  plan: 'premium',
  startDate: new Date('2023-01-01'),
  endDate: new Date('2024-01-01'),
  autoRenew: true,
  billingCycle: 'yearly'
};

console.log('Valid User Account:');
const userValidation = user.validate();
console.log(`Validation: ${userValidation.valid ? '✅ Valid' : '❌ Invalid'}`);
console.log(`Errors: ${userValidation.errors.length}`);
console.log(`Warnings: ${userValidation.warnings.length}`);
userValidation.warnings.forEach(warning => console.log(`  ⚠️ ${warning}`));

// Test comprehensive serialization/deserialization
const userJson = S7e.serialize(user);
console.log(`\\nSerialized user account (${(userJson.length / 1024).toFixed(2)} KB)`);

const deserializedUser = S7e.deserialize(UserAccount, userJson);
const deserializedValidation = deserializedUser.validate();
console.log(`Deserialized validation: ${deserializedValidation.valid ? '✅ Valid' : '❌ Invalid'}`);

// Test various invalid scenarios
console.log('\\n=== Advanced Validation Error Tests ===\\n');

const invalidScenarios = [
  {
    name: 'Active user without email verification',
    modifications: (u: UserAccount) => {
      u.status = UserStatus.ACTIVE;
      u.isEmailVerified = false;
    }
  },
  {
    name: 'Guest user with admin permissions',
    modifications: (u: UserAccount) => {
      u.role = UserRole.GUEST;
      u.permissions = ['read', 'write', 'admin'];
    }
  },
  {
    name: 'Invalid subscription dates',
    modifications: (u: UserAccount) => {
      u.subscription = {
        plan: 'premium',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2023-01-01'), // End before start
        autoRenew: true,
        billingCycle: 'yearly'
      };
    }
  },
  {
    name: 'Underage user',
    modifications: (u: UserAccount) => {
      u.profile = {
        displayName: 'Young User',
        bio: 'Too young',
        avatarUrl: 'https://example.com/avatar.jpg',
        birthDate: new Date('2015-01-01'), // 8 years old
        phoneNumber: '+1-555-0123'
      };
    }
  },
  {
    name: 'Invalid enum values',
    modifications: (u: UserAccount) => {
      (u as any).role = 'invalid-role';
      (u as any).status = 'invalid-status';
    }
  }
];

invalidScenarios.forEach(({ name, modifications }) => {
  console.log(`Testing: ${name}`);
  const testUser = new UserAccount('TEST', 'test_user', 'test@example.com');
  modifications(testUser);

  const validation = testUser.validate();
  if (validation.valid) {
    console.log('  ❌ Expected validation errors but validation passed');
  } else {
    console.log('  ✅ Validation correctly identified issues:');
    validation.errors.forEach(error => console.log(`    - ${error}`));
  }
  if (validation.warnings.length > 0) {
    console.log('  ⚠️ Warnings:');
    validation.warnings.forEach(warning => console.log(`    - ${warning}`));
  }
  console.log('');
});

// Test business logic methods
console.log('=== Business Logic Validation ===\\n');

const businessUser = new UserAccount('B001', 'business_user', 'business@example.com');
console.log('Testing business logic...');

try {
  businessUser.activate();
  console.log('❌ Should not allow activation without email verification');
} catch (error) {
  console.log(`✅ Correctly prevented activation: ${error.message}`);
}

businessUser.isEmailVerified = true;
businessUser.activate();
console.log(`✅ Activation successful: ${businessUser.status}`);

// Test login attempts and auto-suspension
console.log('\\nTesting login attempt tracking...');
for (let i = 1; i <= 6; i++) {
  businessUser.recordLoginAttempt(false);
  console.log(`Failed attempt ${i}: Status = ${businessUser.status}, Attempts = ${businessUser.loginAttempts}`);

  if (businessUser.status === UserStatus.SUSPENDED) {
    console.log('✅ User automatically suspended after 5 failed attempts');
    break;
  }
}

// Test role updates
console.log('\\nTesting role updates...');
const roleUser = new UserAccount('R001', 'role_user', 'role@example.com');
console.log(`Initial permissions (${roleUser.role}): ${roleUser.permissions.join(', ')}`);

roleUser.updateRole(UserRole.MODERATOR);
console.log(`Updated permissions (${roleUser.role}): ${roleUser.permissions.join(', ')}`);

roleUser.updateRole(UserRole.ADMIN);
console.log(`Updated permissions (${roleUser.role}): ${roleUser.permissions.join(', ')}`);
```

## Next Steps

This comprehensive guide demonstrated S7E's type validation capabilities and patterns for robust data integrity. You now have the tools to:

- Implement automatic type validation during deserialization
- Create custom validation logic for business rules
- Handle complex nested object validation
- Build sophisticated cross-field validation
- Design validation-aware class hierarchies

Continue exploring S7E:

- [Optional Properties](/examples/optional-properties) - Handling optional and nullable data
- [Custom Naming](/examples/custom-naming) - API integration strategies
- [API Reference](/api/decorators) - Complete decorator documentation
- [Basic Usage](/examples/basic-usage) - Core S7E patterns
