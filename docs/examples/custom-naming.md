# Custom Naming

S7E provides flexible property naming strategies to integrate with various APIs and maintain clean TypeScript code. This guide demonstrates different naming conventions, custom transformations, and best practices for API compatibility.

## Basic Property Naming

Understanding the `name` property in `@JsonProperty` for simple mapping.

```typescript
import { S7e, JsonClass, JsonProperty } from 's7e';

@JsonClass({ name: 'ApiResponse' })
class ApiResponse {
  // Map TypeScript camelCase to JSON snake_case
  @JsonProperty({ name: 'user_id', type: Number })
  public userId: number;

  @JsonProperty({ name: 'user_name', type: String })
  public userName: string;

  @JsonProperty({ name: 'email_address', type: String })
  public emailAddress: string;

  @JsonProperty({ name: 'created_at', type: Date })
  public createdAt: Date;

  @JsonProperty({ name: 'updated_at', type: Date })
  public updatedAt: Date;

  @JsonProperty({ name: 'is_active', type: Boolean })
  public isActive: boolean;

  @JsonProperty({ name: 'profile_image_url', type: String, optional: true })
  public profileImageUrl?: string;

  constructor(userId: number, userName: string, emailAddress: string) {
    this.userId = userId;
    this.userName = userName;
    this.emailAddress = emailAddress;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.isActive = true;
  }

  public updateProfile(userName?: string, profileImageUrl?: string): void {
    if (userName) this.userName = userName;
    if (profileImageUrl) this.profileImageUrl = profileImageUrl;
    this.updatedAt = new Date();
  }
}

// Example usage
const user = new ApiResponse(123, 'john_doe', 'john@example.com');
user.updateProfile('john_doe_updated', 'https://example.com/avatar.jpg');

console.log('TypeScript Object:');
console.log(`User ID: ${user.userId}`);
console.log(`User Name: ${user.userName}`);
console.log(`Email: ${user.emailAddress}`);
console.log(`Active: ${user.isActive}`);
console.log(`Profile Image: ${user.profileImageUrl}`);

// Serialize to API format (snake_case)
const apiJson = S7e.serialize(user);
console.log('\\nAPI JSON (snake_case):');
console.log(apiJson);

// Parse the JSON to see the structure
const parsed = JSON.parse(apiJson);
console.log('\\nParsed API JSON structure:');
console.log(`user_id: ${parsed.user_id}`);
console.log(`user_name: ${parsed.user_name}`);
console.log(`email_address: ${parsed.email_address}`);
console.log(`created_at: ${parsed.created_at}`);
console.log(`is_active: ${parsed.is_active}`);
console.log(`profile_image_url: ${parsed.profile_image_url}`);

// Deserialize from API format back to TypeScript
const apiJsonData = `{
  "user_id": 456,
  "user_name": "jane_smith",
  "email_address": "jane@example.com",
  "created_at": "2023-01-15T10:30:00.000Z",
  "updated_at": "2023-06-20T14:45:00.000Z",
  "is_active": true,
  "profile_image_url": "https://example.com/jane-avatar.jpg"
}`;

const deserializedUser = S7e.deserialize(ApiResponse, apiJsonData);
console.log('\\nDeserialized from API:');
console.log(`User ID: ${deserializedUser.userId}`);
console.log(`User Name: ${deserializedUser.userName}`);
console.log(`Email: ${deserializedUser.emailAddress}`);
console.log(`Created: ${deserializedUser.createdAt.toISOString()}`);
console.log(`Updated: ${deserializedUser.updatedAt.toISOString()}`);
console.log(`Active: ${deserializedUser.isActive}`);
```

## Different Naming Conventions

Working with various API styles and conventions.

```typescript
// PascalCase API (common in .NET/C# APIs)
@JsonClass({ name: 'PascalCaseUser' })
class PascalCaseUser {
  @JsonProperty({ name: 'UserId', type: Number })
  public userId: number;

  @JsonProperty({ name: 'FirstName', type: String })
  public firstName: string;

  @JsonProperty({ name: 'LastName', type: String })
  public lastName: string;

  @JsonProperty({ name: 'EmailAddress', type: String })
  public emailAddress: string;

  @JsonProperty({ name: 'DateOfBirth', type: Date, optional: true })
  public dateOfBirth?: Date;

  @JsonProperty({ name: 'IsEmailVerified', type: Boolean })
  public isEmailVerified: boolean;

  @JsonProperty({ name: 'AccountType', type: String })
  public accountType: string;

  constructor(userId: number, firstName: string, lastName: string, emailAddress: string) {
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.emailAddress = emailAddress;
    this.isEmailVerified = false;
    this.accountType = 'standard';
  }
}

// kebab-case API (common in some REST APIs)
@JsonClass({ name: 'KebabCaseProduct' })
class KebabCaseProduct {
  @JsonProperty({ name: 'product-id', type: String })
  public productId: string;

  @JsonProperty({ name: 'product-name', type: String })
  public productName: string;

  @JsonProperty({ name: 'product-description', type: String })
  public productDescription: string;

  @JsonProperty({ name: 'unit-price', type: Number })
  public unitPrice: number;

  @JsonProperty({ name: 'stock-quantity', type: Number })
  public stockQuantity: number;

  @JsonProperty({ name: 'category-id', type: String })
  public categoryId: string;

  @JsonProperty({ name: 'is-available', type: Boolean })
  public isAvailable: boolean;

  @JsonProperty({ name: 'created-date', type: Date })
  public createdDate: Date;

  @JsonProperty({ name: 'last-updated', type: Date })
  public lastUpdated: Date;

  constructor(productId: string, productName: string, description: string, price: number) {
    this.productId = productId;
    this.productName = productName;
    this.productDescription = description;
    this.unitPrice = price;
    this.stockQuantity = 0;
    this.categoryId = 'general';
    this.isAvailable = true;
    this.createdDate = new Date();
    this.lastUpdated = new Date();
  }
}

// SCREAMING_SNAKE_CASE (common in some configuration APIs)
@JsonClass({ name: 'ConfigurationItem' })
class ConfigurationItem {
  @JsonProperty({ name: 'CONFIG_KEY', type: String })
  public configKey: string;

  @JsonProperty({ name: 'CONFIG_VALUE', type: String })
  public configValue: string;

  @JsonProperty({ name: 'CONFIG_TYPE', type: String })
  public configType: string;

  @JsonProperty({ name: 'IS_SENSITIVE', type: Boolean })
  public isSensitive: boolean;

  @JsonProperty({ name: 'ENVIRONMENT_NAME', type: String })
  public environmentName: string;

  @JsonProperty({ name: 'LAST_MODIFIED_BY', type: String })
  public lastModifiedBy: string;

  @JsonProperty({ name: 'MODIFICATION_TIMESTAMP', type: Date })
  public modificationTimestamp: Date;

  constructor(key: string, value: string, type: string = 'string') {
    this.configKey = key;
    this.configValue = value;
    this.configType = type;
    this.isSensitive = false;
    this.environmentName = 'production';
    this.lastModifiedBy = 'system';
    this.modificationTimestamp = new Date();
  }
}

// Test different naming conventions
console.log('=== PascalCase API Test ===');
const pascalUser = new PascalCaseUser(1, 'John', 'Doe', 'john@example.com');
pascalUser.dateOfBirth = new Date('1990-01-01');
pascalUser.isEmailVerified = true;

const pascalJson = S7e.serialize(pascalUser);
console.log('PascalCase JSON:', pascalJson);

const deserializedPascal = S7e.deserialize(PascalCaseUser, pascalJson);
console.log(`Deserialized: ${deserializedPascal.firstName} ${deserializedPascal.lastName}`);

console.log('\\n=== kebab-case API Test ===');
const kebabProduct = new KebabCaseProduct('prod-123', 'Awesome Widget', 'A really awesome widget', 29.99);
kebabProduct.stockQuantity = 100;
kebabProduct.categoryId = 'electronics';

const kebabJson = S7e.serialize(kebabProduct);
console.log('kebab-case JSON:', kebabJson);

const deserializedKebab = S7e.deserialize(KebabCaseProduct, kebabJson);
console.log(`Deserialized: ${deserializedKebab.productName} - $${deserializedKebab.unitPrice}`);

console.log('\\n=== SCREAMING_SNAKE_CASE API Test ===');
const configItem = new ConfigurationItem('DATABASE_URL', 'postgresql://localhost:5432/myapp', 'connection_string');
configItem.isSensitive = true;
configItem.lastModifiedBy = 'admin';

const configJson = S7e.serialize(configItem);
console.log('SCREAMING_SNAKE_CASE JSON:', configJson);

const deserializedConfig = S7e.deserialize(ConfigurationItem, configJson);
console.log(`Deserialized: ${deserializedConfig.configKey} = ${deserializedConfig.configValue}`);
```

## Complex Nested Object Naming

Handling naming conventions in nested objects and hierarchical data.

```typescript
@JsonClass({ name: 'Address' })
class Address {
  @JsonProperty({ name: 'street_address', type: String })
  public streetAddress: string;

  @JsonProperty({ name: 'address_line_2', type: String, optional: true })
  public addressLine2?: string;

  @JsonProperty({ name: 'city_name', type: String })
  public cityName: string;

  @JsonProperty({ name: 'state_province', type: String })
  public stateProvince: string;

  @JsonProperty({ name: 'postal_code', type: String })
  public postalCode: string;

  @JsonProperty({ name: 'country_code', type: String })
  public countryCode: string;

  constructor(street: string, city: string, state: string, postal: string, country: string = 'US') {
    this.streetAddress = street;
    this.cityName = city;
    this.stateProvince = state;
    this.postalCode = postal;
    this.countryCode = country;
  }

  public getFullAddress(): string {
    let address = this.streetAddress;
    if (this.addressLine2) address += `, ${this.addressLine2}`;
    address += `, ${this.cityName}, ${this.stateProvince} ${this.postalCode}`;
    if (this.countryCode !== 'US') address += `, ${this.countryCode}`;
    return address;
  }
}

@JsonClass({ name: 'ContactMethod' })
class ContactMethod {
  @JsonProperty({ name: 'contact_type', type: String })
  public contactType: string; // 'email', 'phone', 'fax', 'mobile'

  @JsonProperty({ name: 'contact_value', type: String })
  public contactValue: string;

  @JsonProperty({ name: 'is_primary', type: Boolean })
  public isPrimary: boolean;

  @JsonProperty({ name: 'is_verified', type: Boolean })
  public isVerified: boolean;

  @JsonProperty({ name: 'verification_date', type: Date, optional: true })
  public verificationDate?: Date;

  constructor(type: string, value: string, isPrimary: boolean = false) {
    this.contactType = type;
    this.contactValue = value;
    this.isPrimary = isPrimary;
    this.isVerified = false;
  }

  public verify(): void {
    this.isVerified = true;
    this.verificationDate = new Date();
  }
}

@JsonClass({ name: 'BusinessEntity' })
class BusinessEntity {
  @JsonProperty({ name: 'entity_id', type: String })
  public entityId: string;

  @JsonProperty({ name: 'legal_name', type: String })
  public legalName: string;

  @JsonProperty({ name: 'doing_business_as', type: String, optional: true })
  public doingBusinessAs?: string;

  @JsonProperty({ name: 'tax_identification_number', type: String })
  public taxIdentificationNumber: string;

  @JsonProperty({ name: 'business_type', type: String })
  public businessType: string; // 'corporation', 'llc', 'partnership', 'sole_proprietorship'

  @JsonProperty({ name: 'incorporation_date', type: Date })
  public incorporationDate: Date;

  @JsonProperty({ name: 'primary_address', type: Address })
  public primaryAddress: Address;

  @JsonProperty({ name: 'mailing_address', type: Address, optional: true })
  public mailingAddress?: Address;

  @JsonProperty({ name: 'contact_methods', type: [ContactMethod] })
  public contactMethods: ContactMethod[];

  @JsonProperty({ name: 'primary_contact_person', type: Object })
  public primaryContactPerson: {
    first_name: string;
    last_name: string;
    job_title: string;
    email_address: string;
    phone_number: string;
  };

  @JsonProperty({ name: 'business_hours', type: Object, optional: true })
  public businessHours?: {
    monday: { open_time: string; close_time: string; is_closed: boolean };
    tuesday: { open_time: string; close_time: string; is_closed: boolean };
    wednesday: { open_time: string; close_time: string; is_closed: boolean };
    thursday: { open_time: string; close_time: string; is_closed: boolean };
    friday: { open_time: string; close_time: string; is_closed: boolean };
    saturday: { open_time: string; close_time: string; is_closed: boolean };
    sunday: { open_time: string; close_time: string; is_closed: boolean };
  };

  @JsonProperty({ name: 'annual_revenue', type: Number, optional: true })
  public annualRevenue?: number;

  @JsonProperty({ name: 'employee_count', type: Number, optional: true })
  public employeeCount?: number;

  @JsonProperty({ name: 'industry_classification_codes', type: [String], optional: true })
  public industryClassificationCodes?: string[];

  @JsonProperty({ name: 'compliance_status', type: Object })
  public complianceStatus: {
    is_tax_compliant: boolean;
    is_license_current: boolean;
    last_audit_date: string;
    next_filing_due_date: string;
  };

  constructor(
    entityId: string,
    legalName: string,
    taxId: string,
    businessType: string,
    incorporationDate: Date,
    primaryAddress: Address,
    primaryContact: {
      first_name: string;
      last_name: string;
      job_title: string;
      email_address: string;
      phone_number: string;
    }
  ) {
    this.entityId = entityId;
    this.legalName = legalName;
    this.taxIdentificationNumber = taxId;
    this.businessType = businessType;
    this.incorporationDate = incorporationDate;
    this.primaryAddress = primaryAddress;
    this.contactMethods = [];
    this.primaryContactPerson = primaryContact;
    this.complianceStatus = {
      is_tax_compliant: true,
      is_license_current: true,
      last_audit_date: new Date().toISOString().split('T')[0],
      next_filing_due_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }

  public addContactMethod(type: string, value: string, isPrimary: boolean = false): void {
    const contact = new ContactMethod(type, value, isPrimary);
    this.contactMethods.push(contact);
  }

  public getPrimaryContactMethods(): ContactMethod[] {
    return this.contactMethods.filter(c => c.isPrimary);
  }

  public getVerifiedContactMethods(): ContactMethod[] {
    return this.contactMethods.filter(c => c.isVerified);
  }

  public setMailingAddress(address: Address): void {
    this.mailingAddress = address;
  }

  public setBusinessHours(hours: NonNullable<BusinessEntity['businessHours']>): void {
    this.businessHours = hours;
  }

  public updateComplianceStatus(taxCompliant: boolean, licensesCurrent: boolean): void {
    this.complianceStatus.is_tax_compliant = taxCompliant;
    this.complianceStatus.is_license_current = licensesCurrent;
    this.complianceStatus.last_audit_date = new Date().toISOString().split('T')[0];
  }

  public getDisplayName(): string {
    return this.doingBusinessAs || this.legalName;
  }
}

// Create a complex business entity with nested naming conventions
const businessAddress = new Address('123 Business Ave', 'Springfield', 'IL', '62701');
businessAddress.addressLine2 = 'Suite 100';

const mailingAddress = new Address('PO Box 456', 'Springfield', 'IL', '62701');

const primaryContact = {
  first_name: 'John',
  last_name: 'Smith',
  job_title: 'Chief Executive Officer',
  email_address: 'john.smith@acmecorp.com',
  phone_number: '+1-555-0123'
};

const business = new BusinessEntity(
  'ENT-2023-001',
  'Acme Corporation LLC',
  '12-3456789',
  'llc',
  new Date('2020-01-15'),
  businessAddress,
  primaryContact
);

business.doingBusinessAs = 'Acme Corp';
business.annualRevenue = 2500000;
business.employeeCount = 25;
business.industryClassificationCodes = ['541511', '541512']; // Computer Systems Design

// Add contact methods
business.addContactMethod('email', 'info@acmecorp.com', true);
business.addContactMethod('phone', '+1-555-0124', true);
business.addContactMethod('fax', '+1-555-0125', false);
business.addContactMethod('mobile', '+1-555-0126', false);

// Verify some contact methods
business.contactMethods[0].verify(); // Email
business.contactMethods[1].verify(); // Phone

business.setMailingAddress(mailingAddress);

// Set business hours
business.setBusinessHours({
  monday: { open_time: '09:00', close_time: '17:00', is_closed: false },
  tuesday: { open_time: '09:00', close_time: '17:00', is_closed: false },
  wednesday: { open_time: '09:00', close_time: '17:00', is_closed: false },
  thursday: { open_time: '09:00', close_time: '17:00', is_closed: false },
  friday: { open_time: '09:00', close_time: '17:00', is_closed: false },
  saturday: { open_time: '10:00', close_time: '14:00', is_closed: false },
  sunday: { open_time: '00:00', close_time: '00:00', is_closed: true }
});

console.log('=== Complex Business Entity ===');
console.log(`Business: ${business.getDisplayName()}`);
console.log(`Legal Name: ${business.legalName}`);
console.log(`Address: ${business.primaryAddress.getFullAddress()}`);
console.log(`Primary Contact: ${business.primaryContactPerson.first_name} ${business.primaryContactPerson.last_name}`);
console.log(`Contact Methods: ${business.contactMethods.length}`);
console.log(`Primary Contacts: ${business.getPrimaryContactMethods().length}`);
console.log(`Verified Contacts: ${business.getVerifiedContactMethods().length}`);

// Serialize the complex nested structure
const businessJson = S7e.serialize(business);
console.log('\\nSerialized Business JSON:');
console.log(`JSON size: ${(businessJson.length / 1024).toFixed(2)} KB`);

// Parse to see the nested naming structure
const parsedBusiness = JSON.parse(businessJson);
console.log('\\nNested naming structure verification:');
console.log(`entity_id: ${parsedBusiness.entity_id}`);
console.log(`legal_name: ${parsedBusiness.legal_name}`);
console.log(`primary_address.street_address: ${parsedBusiness.primary_address.street_address}`);
console.log(`primary_address.city_name: ${parsedBusiness.primary_address.city_name}`);
console.log(`mailing_address.postal_code: ${parsedBusiness.mailing_address.postal_code}`);
console.log(`contact_methods[0].contact_type: ${parsedBusiness.contact_methods[0].contact_type}`);
console.log(`contact_methods[0].is_verified: ${parsedBusiness.contact_methods[0].is_verified}`);
console.log(`primary_contact_person.first_name: ${parsedBusiness.primary_contact_person.first_name}`);
console.log(`business_hours.monday.open_time: ${parsedBusiness.business_hours.monday.open_time}`);
console.log(`compliance_status.is_tax_compliant: ${parsedBusiness.compliance_status.is_tax_compliant}`);

// Deserialize and verify nested objects maintain their naming
const deserializedBusiness = S7e.deserialize(BusinessEntity, businessJson);

console.log('\\nDeserialization verification:');
console.log(`Display Name: ${deserializedBusiness.getDisplayName()}`);
console.log(`Primary Address: ${deserializedBusiness.primaryAddress.getFullAddress()}`);
console.log(`Mailing Address: ${deserializedBusiness.mailingAddress?.getFullAddress()}`);
console.log(`Contact Methods: ${deserializedBusiness.contactMethods.length}`);
console.log(`First Contact Type: ${deserializedBusiness.contactMethods[0].contactType}`);
console.log(`First Contact Verified: ${deserializedBusiness.contactMethods[0].isVerified}`);
console.log(`Primary Contact: ${deserializedBusiness.primaryContactPerson.first_name} ${deserializedBusiness.primaryContactPerson.last_name}`);
console.log(`Monday Hours: ${deserializedBusiness.businessHours?.monday.open_time} - ${deserializedBusiness.businessHours?.monday.close_time}`);
console.log(`Tax Compliant: ${deserializedBusiness.complianceStatus.is_tax_compliant}`);

// Verify instances are properly created
console.log('\\nInstance verification:');
console.log(`Business is BusinessEntity: ${deserializedBusiness instanceof BusinessEntity}`);
console.log(`Primary Address is Address: ${deserializedBusiness.primaryAddress instanceof Address}`);
console.log(`Mailing Address is Address: ${deserializedBusiness.mailingAddress instanceof Address}`);
console.log(`First Contact is ContactMethod: ${deserializedBusiness.contactMethods[0] instanceof ContactMethod}`);
console.log(`Incorporation Date is Date: ${deserializedBusiness.incorporationDate instanceof Date}`);
```

## API Integration Patterns

Real-world patterns for integrating with different API styles.

```typescript
// GitHub API style (camelCase with some snake_case)
@JsonClass({ name: 'GitHubRepository' })
class GitHubRepository {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'full_name', type: String })
  public fullName: string;

  @JsonProperty({ name: 'private', type: Boolean })
  public isPrivate: boolean;

  @JsonProperty({ name: 'html_url', type: String })
  public htmlUrl: string;

  @JsonProperty({ name: 'clone_url', type: String })
  public cloneUrl: string;

  @JsonProperty({ name: 'default_branch', type: String })
  public defaultBranch: string;

  @JsonProperty({ name: 'created_at', type: Date })
  public createdAt: Date;

  @JsonProperty({ name: 'updated_at', type: Date })
  public updatedAt: Date;

  @JsonProperty({ name: 'pushed_at', type: Date })
  public pushedAt: Date;

  @JsonProperty({ name: 'stargazers_count', type: Number })
  public stargazersCount: number;

  @JsonProperty({ name: 'watchers_count', type: Number })
  public watchersCount: number;

  @JsonProperty({ name: 'forks_count', type: Number })
  public forksCount: number;

  @JsonProperty({ name: 'open_issues_count', type: Number })
  public openIssuesCount: number;

  @JsonProperty({ name: 'owner', type: Object })
  public owner: {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
    type: string;
  };

  constructor(id: number, name: string, fullName: string, owner: GitHubRepository['owner']) {
    this.id = id;
    this.name = name;
    this.fullName = fullName;
    this.owner = owner;
    this.isPrivate = false;
    this.htmlUrl = '';
    this.cloneUrl = '';
    this.defaultBranch = 'main';
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.pushedAt = new Date();
    this.stargazersCount = 0;
    this.watchersCount = 0;
    this.forksCount = 0;
    this.openIssuesCount = 0;
  }
}

// Stripe API style (snake_case throughout)
@JsonClass({ name: 'StripeCustomer' })
class StripeCustomer {
  @JsonProperty({ name: 'id', type: String })
  public id: string;

  @JsonProperty({ name: 'object', type: String })
  public object: string; // Always 'customer'

  @JsonProperty({ name: 'created', type: Number })
  public created: number; // Unix timestamp

  @JsonProperty({ name: 'email', type: String, optional: true })
  public email?: string;

  @JsonProperty({ name: 'name', type: String, optional: true })
  public name?: string;

  @JsonProperty({ name: 'phone', type: String, optional: true })
  public phone?: string;

  @JsonProperty({ name: 'address', type: Object, optional: true })
  public address?: {
    city: string;
    country: string;
    line1: string;
    line2: string;
    postal_code: string;
    state: string;
  };

  @JsonProperty({ name: 'default_source', type: String, optional: true })
  public defaultSource?: string;

  @JsonProperty({ name: 'invoice_prefix', type: String, optional: true })
  public invoicePrefix?: string;

  @JsonProperty({ name: 'invoice_settings', type: Object, optional: true })
  public invoiceSettings?: {
    custom_fields: Array<{ name: string; value: string }>;
    default_payment_method: string;
    footer: string;
  };

  @JsonProperty({ name: 'metadata', type: Object })
  public metadata: Record<string, string>;

  @JsonProperty({ name: 'balance', type: Number })
  public balance: number; // In cents

  @JsonProperty({ name: 'currency', type: String, optional: true })
  public currency?: string;

  @JsonProperty({ name: 'delinquent', type: Boolean })
  public delinquent: boolean;

  @JsonProperty({ name: 'description', type: String, optional: true })
  public description?: string;

  @JsonProperty({ name: 'livemode', type: Boolean })
  public livemode: boolean;

  constructor(id: string) {
    this.id = id;
    this.object = 'customer';
    this.created = Math.floor(Date.now() / 1000);
    this.metadata = {};
    this.balance = 0;
    this.delinquent = false;
    this.livemode = false;
  }
}

// AWS API style (PascalCase)
@JsonClass({ name: 'AWSInstance' })
class AWSInstance {
  @JsonProperty({ name: 'InstanceId', type: String })
  public instanceId: string;

  @JsonProperty({ name: 'ImageId', type: String })
  public imageId: string;

  @JsonProperty({ name: 'InstanceType', type: String })
  public instanceType: string;

  @JsonProperty({ name: 'LaunchTime', type: Date })
  public launchTime: Date;

  @JsonProperty({ name: 'State', type: Object })
  public state: {
    Code: number;
    Name: string;
  };

  @JsonProperty({ name: 'PublicDnsName', type: String, optional: true })
  public publicDnsName?: string;

  @JsonProperty({ name: 'PublicIpAddress', type: String, optional: true })
  public publicIpAddress?: string;

  @JsonProperty({ name: 'PrivateIpAddress', type: String })
  public privateIpAddress: string;

  @JsonProperty({ name: 'SecurityGroups', type: [Object] })
  public securityGroups: Array<{
    GroupId: string;
    GroupName: string;
  }>;

  @JsonProperty({ name: 'Tags', type: [Object], optional: true })
  public tags?: Array<{
    Key: string;
    Value: string;
  }>;

  @JsonProperty({ name: 'VpcId', type: String })
  public vpcId: string;

  @JsonProperty({ name: 'SubnetId', type: String })
  public subnetId: string;

  @JsonProperty({ name: 'Monitoring', type: Object })
  public monitoring: {
    State: string; // 'enabled' | 'disabled'
  };

  constructor(instanceId: string, imageId: string, instanceType: string) {
    this.instanceId = instanceId;
    this.imageId = imageId;
    this.instanceType = instanceType;
    this.launchTime = new Date();
    this.state = { Code: 16, Name: 'running' };
    this.privateIpAddress = '10.0.0.100';
    this.securityGroups = [];
    this.vpcId = 'vpc-12345678';
    this.subnetId = 'subnet-12345678';
    this.monitoring = { State: 'disabled' };
  }
}

// Test API integration patterns
console.log('=== API Integration Patterns ===\\n');

// GitHub API simulation
const githubRepo = new GitHubRepository(
  12345,
  's7e',
  'myorg/s7e',
  {
    id: 67890,
    login: 'myorg',
    avatar_url: 'https://github.com/myorg.png',
    html_url: 'https://github.com/myorg',
    type: 'Organization'
  }
);

githubRepo.htmlUrl = 'https://github.com/myorg/s7e';
githubRepo.cloneUrl = 'https://github.com/myorg/s7e.git';
githubRepo.stargazersCount = 1250;
githubRepo.forksCount = 89;
githubRepo.openIssuesCount = 5;

console.log('GitHub API Style:');
const githubJson = S7e.serialize(githubRepo);
console.log(`Repository: ${githubRepo.fullName}`);
console.log(`Stars: ${githubRepo.stargazersCount}, Forks: ${githubRepo.forksCount}`);
console.log(`JSON structure includes snake_case: ${githubJson.includes('stargazers_count')}`);

// Stripe API simulation
const stripeCustomer = new StripeCustomer('cus_123456789');
stripeCustomer.email = 'customer@example.com';
stripeCustomer.name = 'John Doe';
stripeCustomer.phone = '+1-555-0123';
stripeCustomer.balance = -2500; // $25.00 credit
stripeCustomer.currency = 'usd';
stripeCustomer.metadata = {
  'internal_id': '12345',
  'source': 'website',
  'plan': 'premium'
};

console.log('\\nStripe API Style:');
const stripeJson = S7e.serialize(stripeCustomer);
console.log(`Customer: ${stripeCustomer.name} (${stripeCustomer.email})`);
console.log(`Balance: $${(stripeCustomer.balance / 100).toFixed(2)}`);
console.log(`Metadata keys: ${Object.keys(stripeCustomer.metadata).join(', ')}`);
console.log(`JSON structure is snake_case: ${stripeJson.includes('default_source')}`);

// AWS API simulation
const awsInstance = new AWSInstance('i-1234567890abcdef0', 'ami-12345678', 't3.medium');
awsInstance.publicIpAddress = '203.0.113.12';
awsInstance.publicDnsName = 'ec2-203-0-113-12.compute-1.amazonaws.com';
awsInstance.securityGroups = [
  { GroupId: 'sg-12345678', GroupName: 'web-servers' },
  { GroupId: 'sg-87654321', GroupName: 'ssh-access' }
];
awsInstance.tags = [
  { Key: 'Name', Value: 'web-server-01' },
  { Key: 'Environment', Value: 'production' },
  { Key: 'Owner', Value: 'devops-team' }
];
awsInstance.monitoring.State = 'enabled';

console.log('\\nAWS API Style:');
const awsJson = S7e.serialize(awsInstance);
console.log(`Instance: ${awsInstance.instanceId} (${awsInstance.instanceType})`);
console.log(`State: ${awsInstance.state.Name}`);
console.log(`Security Groups: ${awsInstance.securityGroups.length}`);
console.log(`Tags: ${awsInstance.tags?.length || 0}`);
console.log(`JSON structure is PascalCase: ${awsJson.includes('InstanceId')}`);

// Demonstrate cross-API data exchange
console.log('\\n=== Cross-API Data Exchange ===');

// Serialize all different API styles
const allApis = [githubRepo, stripeCustomer, awsInstance];
const combinedJson = S7e.serializeArray(allApis);

console.log(`Combined APIs JSON size: ${(combinedJson.length / 1024).toFixed(2)} KB`);

// Parse combined JSON to see mixed naming conventions
const parsedCombined = JSON.parse(combinedJson);
console.log('\\nMixed naming conventions in single JSON:');
console.log(`GitHub: ${parsedCombined[0].full_name} (${parsedCombined[0].stargazers_count} stars)`);
console.log(`Stripe: ${parsedCombined[1].email} (balance: ${parsedCombined[1].balance})`);
console.log(`AWS: ${parsedCombined[2].InstanceId} (${parsedCombined[2].State.Name})`);

// Deserialize mixed API data
const [deserializedGithub, deserializedStripe, deserializedAws] = S7e.deserializeArray(
  [GitHubRepository, StripeCustomer, AWSInstance],
  combinedJson
);

console.log('\\nDeserialized mixed APIs:');
console.log(`GitHub repo: ${deserializedGithub.fullName} - ${deserializedGithub.stargazersCount} stars`);
console.log(`Stripe customer: ${deserializedStripe.name} - balance: $${(deserializedStripe.balance / 100).toFixed(2)}`);
console.log(`AWS instance: ${deserializedAws.instanceId} - ${deserializedAws.state.Name}`);

// Verify correct types after mixed deserialization
console.log('\\nType verification after mixed deserialization:');
console.log(`GitHub instance: ${deserializedGithub instanceof GitHubRepository}`);
console.log(`GitHub dates: ${deserializedGithub.createdAt instanceof Date}`);
console.log(`Stripe instance: ${deserializedStripe instanceof StripeCustomer}`);
console.log(`AWS instance: ${deserializedAws instanceof AWSInstance}`);
console.log(`AWS dates: ${deserializedAws.launchTime instanceof Date}`);
```

## Next Steps

This guide demonstrated comprehensive naming strategies for API integration. Continue exploring:

- [Type Validation](/examples/type-validation) - Advanced validation and error handling
- [Basic Usage](/examples/basic-usage) - Core S7E patterns
- [API Reference](/api/decorators) - Complete decorator documentation
