# Optional Properties

S7E provides flexible handling of optional properties, allowing you to work with data that may have missing or undefined values. This guide demonstrates patterns for optional properties, nullable values, and graceful degradation.

## Basic Optional Properties

Understanding how to define and work with optional properties.

```typescript
import { S7e, JsonClass, JsonProperty } from 's7e';

@JsonClass({ name: 'UserProfile' })
class UserProfile {
  // Required properties
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'username', type: String })
  public username: string;

  @JsonProperty({ name: 'email', type: String })
  public email: string;

  // Optional properties
  @JsonProperty({ name: 'firstName', type: String, optional: true })
  public firstName?: string;

  @JsonProperty({ name: 'lastName', type: String, optional: true })
  public lastName?: string;

  @JsonProperty({ name: 'avatar', type: String, optional: true })
  public avatar?: string;

  @JsonProperty({ name: 'bio', type: String, optional: true })
  public bio?: string;

  @JsonProperty({ name: 'website', type: String, optional: true })
  public website?: string;

  @JsonProperty({ name: 'phoneNumber', type: String, optional: true })
  public phoneNumber?: string;

  @JsonProperty({ name: 'birthDate', type: Date, optional: true })
  public birthDate?: Date;

  @JsonProperty({ name: 'preferences', type: Object, optional: true })
  public preferences?: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
    privacy: 'public' | 'private' | 'friends';
  };

  constructor(id: number, username: string, email: string) {
    this.id = id;
    this.username = username;
    this.email = email;
  }

  public getDisplayName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    if (this.firstName) {
      return this.firstName;
    }
    return this.username;
  }

  public isProfileComplete(): boolean {
    return !!(
      this.firstName &&
      this.lastName &&
      this.avatar &&
      this.bio &&
      this.birthDate
    );
  }

  public getAge(): number | undefined {
    if (!this.birthDate) return undefined;
    const today = new Date();
    let age = today.getFullYear() - this.birthDate.getFullYear();
    const monthDiff = today.getMonth() - this.birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.birthDate.getDate())) {
      age--;
    }
    return age;
  }

  public setDefaultPreferences(): void {
    this.preferences = {
      theme: 'light',
      language: 'en',
      notifications: true,
      privacy: 'private'
    };
  }
}

// Example 1: Minimal user data (only required fields)
const minimalUser = new UserProfile(1, 'john_doe', 'john@example.com');

console.log('Minimal User:');
console.log(`Display Name: ${minimalUser.getDisplayName()}`);
console.log(`Profile Complete: ${minimalUser.isProfileComplete()}`);
console.log(`Age: ${minimalUser.getAge() ?? 'Unknown'}`);

// Serialize minimal user
const minimalJson = S7e.serialize(minimalUser);
console.log('\\nMinimal JSON:', minimalJson);

// Example 2: Complete user data
const completeUser = new UserProfile(2, 'jane_smith', 'jane@example.com');
completeUser.firstName = 'Jane';
completeUser.lastName = 'Smith';
completeUser.avatar = 'https://example.com/avatars/jane.jpg';
completeUser.bio = 'Software engineer passionate about TypeScript and web development.';
completeUser.website = 'https://janesmith.dev';
completeUser.phoneNumber = '+1-555-0123';
completeUser.birthDate = new Date('1990-05-15');
completeUser.setDefaultPreferences();

console.log('\\nComplete User:');
console.log(`Display Name: ${completeUser.getDisplayName()}`);
console.log(`Profile Complete: ${completeUser.isProfileComplete()}`);
console.log(`Age: ${completeUser.getAge()}`);

// Serialize complete user
const completeJson = S7e.serialize(completeUser);
console.log('\\nComplete JSON:', completeJson);

// Example 3: Deserializing different JSON structures
const minimalJsonData = '{"id":3,"username":"bob_wilson","email":"bob@example.com"}';
const partialJsonData = `{
  "id": 4,
  "username": "alice_brown",
  "email": "alice@example.com",
  "firstName": "Alice",
  "bio": "UX Designer",
  "preferences": {
    "theme": "dark",
    "language": "en",
    "notifications": false,
    "privacy": "public"
  }
}`;

const deserializedMinimal = S7e.deserialize(UserProfile, minimalJsonData);
const deserializedPartial = S7e.deserialize(UserProfile, partialJsonData);

console.log('\\nDeserialized Users:');
console.log(`Minimal - Display: ${deserializedMinimal.getDisplayName()}, Complete: ${deserializedMinimal.isProfileComplete()}`);
console.log(`Partial - Display: ${deserializedPartial.getDisplayName()}, Theme: ${deserializedPartial.preferences?.theme}`);
```

## Optional Nested Objects

Working with optional complex objects and nested structures.

```typescript
@JsonClass({ name: 'Address' })
class Address {
  @JsonProperty({ name: 'street', type: String })
  public street: string;

  @JsonProperty({ name: 'city', type: String })
  public city: string;

  @JsonProperty({ name: 'state', type: String })
  public state: string;

  @JsonProperty({ name: 'zipCode', type: String })
  public zipCode: string;

  @JsonProperty({ name: 'country', type: String })
  public country: string;

  constructor(street: string, city: string, state: string, zipCode: string, country: string = 'USA') {
    this.street = street;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
    this.country = country;
  }

  public getFullAddress(): string {
    return `${this.street}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
  }
}

@JsonClass({ name: 'ContactInfo' })
class ContactInfo {
  @JsonProperty({ name: 'primaryEmail', type: String })
  public primaryEmail: string;

  @JsonProperty({ name: 'secondaryEmail', type: String, optional: true })
  public secondaryEmail?: string;

  @JsonProperty({ name: 'homePhone', type: String, optional: true })
  public homePhone?: string;

  @JsonProperty({ name: 'workPhone', type: String, optional: true })
  public workPhone?: string;

  @JsonProperty({ name: 'mobile', type: String, optional: true })
  public mobile?: string;

  @JsonProperty({ name: 'fax', type: String, optional: true })
  public fax?: string;

  @JsonProperty({ name: 'emergencyContact', type: Object, optional: true })
  public emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };

  constructor(primaryEmail: string) {
    this.primaryEmail = primaryEmail;
  }

  public getAllEmails(): string[] {
    const emails = [this.primaryEmail];
    if (this.secondaryEmail) {
      emails.push(this.secondaryEmail);
    }
    return emails;
  }

  public getAllPhones(): string[] {
    const phones: string[] = [];
    if (this.homePhone) phones.push(this.homePhone);
    if (this.workPhone) phones.push(this.workPhone);
    if (this.mobile) phones.push(this.mobile);
    return phones;
  }

  public getBestContactPhone(): string | undefined {
    return this.mobile || this.workPhone || this.homePhone;
  }
}

@JsonClass({ name: 'Person' })
class Person {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'name', type: String })
  public name: string;

  // Required contact info
  @JsonProperty({ name: 'contact', type: ContactInfo })
  public contact: ContactInfo;

  // Optional addresses
  @JsonProperty({ name: 'homeAddress', type: Address, optional: true })
  public homeAddress?: Address;

  @JsonProperty({ name: 'workAddress', type: Address, optional: true })
  public workAddress?: Address;

  @JsonProperty({ name: 'billingAddress', type: Address, optional: true })
  public billingAddress?: Address;

  // Optional personal information
  @JsonProperty({ name: 'dateOfBirth', type: Date, optional: true })
  public dateOfBirth?: Date;

  @JsonProperty({ name: 'socialSecurityNumber', type: String, optional: true })
  public socialSecurityNumber?: string;

  @JsonProperty({ name: 'passportNumber', type: String, optional: true })
  public passportNumber?: string;

  // Optional employment information
  @JsonProperty({ name: 'employer', type: String, optional: true })
  public employer?: string;

  @JsonProperty({ name: 'jobTitle', type: String, optional: true })
  public jobTitle?: string;

  @JsonProperty({ name: 'salary', type: Number, optional: true })
  public salary?: number;

  @JsonProperty({ name: 'startDate', type: Date, optional: true })
  public startDate?: Date;

  constructor(id: number, name: string, primaryEmail: string) {
    this.id = id;
    this.name = name;
    this.contact = new ContactInfo(primaryEmail);
  }

  public getPreferredAddress(): Address | undefined {
    return this.homeAddress || this.workAddress || this.billingAddress;
  }

  public getAllAddresses(): Address[] {
    const addresses: Address[] = [];
    if (this.homeAddress) addresses.push(this.homeAddress);
    if (this.workAddress) addresses.push(this.workAddress);
    if (this.billingAddress) addresses.push(this.billingAddress);
    return addresses;
  }

  public getEmploymentInfo(): { employer?: string; title?: string; tenure?: number } | undefined {
    if (!this.employer && !this.jobTitle) return undefined;

    let tenure: number | undefined;
    if (this.startDate) {\n      const now = new Date();\n      tenure = Math.floor((now.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365));\n    }\n\n    return {\n      employer: this.employer,\n      title: this.jobTitle,\n      tenure\n    };\n  }\n\n  public isEmployed(): boolean {\n    return !!(this.employer || this.jobTitle);\n  }\n\n  public hasCompleteContactInfo(): boolean {\n    return !!(\n      this.contact.getBestContactPhone() &&\n      this.contact.secondaryEmail &&\n      this.homeAddress\n    );\n  }\n}\n\n// Example usage with various levels of completeness\n\n// Person with minimal information\nconst minimalPerson = new Person(1, 'John Doe', 'john@example.com');\nconsole.log('Minimal Person:');\nconsole.log(`Name: ${minimalPerson.name}`);\nconsole.log(`Email: ${minimalPerson.contact.primaryEmail}`);\nconsole.log(`Has complete contact info: ${minimalPerson.hasCompleteContactInfo()}`);\nconsole.log(`Is employed: ${minimalPerson.isEmployed()}`);\nconsole.log(`Preferred address: ${minimalPerson.getPreferredAddress()?.getFullAddress() || 'None'}`);\n\n// Person with partial information\nconst partialPerson = new Person(2, 'Jane Smith', 'jane@example.com');\npartialPerson.contact.mobile = '+1-555-0123';\npartialPerson.contact.secondaryEmail = 'jane.personal@gmail.com';\npartialPerson.homeAddress = new Address('123 Oak St', 'Springfield', 'IL', '62701');\npartialPerson.employer = 'Tech Corp';\npartialPerson.jobTitle = 'Software Engineer';\npartialPerson.startDate = new Date('2020-03-15');\n\nconsole.log('\\nPartial Person:');\nconsole.log(`Name: ${partialPerson.name}`);\nconsole.log(`Best phone: ${partialPerson.contact.getBestContactPhone()}`);\nconsole.log(`All emails: ${partialPerson.contact.getAllEmails().join(', ')}`);\nconsole.log(`Has complete contact info: ${partialPerson.hasCompleteContactInfo()}`);\nconsole.log(`Employment: ${JSON.stringify(partialPerson.getEmploymentInfo())}`);\nconsole.log(`Home address: ${partialPerson.homeAddress?.getFullAddress()}`);\n\n// Person with complete information\nconst completePerson = new Person(3, 'Robert Johnson', 'rob@company.com');\ncompletePerson.contact.secondaryEmail = 'rob.personal@email.com';\ncompletePerson.contact.homePhone = '+1-555-0124';\ncompletePerson.contact.workPhone = '+1-555-0125';\ncompletePerson.contact.mobile = '+1-555-0126';\ncompletePerson.contact.emergencyContact = {\n  name: 'Sarah Johnson',\n  relationship: 'Spouse',\n  phone: '+1-555-0127'\n};\n\ncompletePerson.homeAddress = new Address('456 Pine Ave', 'Chicago', 'IL', '60601');\ncompletePerson.workAddress = new Address('789 Business Blvd', 'Chicago', 'IL', '60602');\ncompletePerson.billingAddress = completePerson.homeAddress; // Same as home\n\ncompletePerson.dateOfBirth = new Date('1985-08-20');\ncompletePerson.employer = 'Big Corp Inc';\ncompletePerson.jobTitle = 'Senior Developer';\ncompletePerson.salary = 95000;\ncompletePerson.startDate = new Date('2018-06-01');\n\nconsole.log('\\nComplete Person:');\nconsole.log(`Name: ${completePerson.name}`);\nconsole.log(`All phones: ${completePerson.contact.getAllPhones().join(', ')}`);\nconsole.log(`Emergency contact: ${completePerson.contact.emergencyContact?.name}`);\nconsole.log(`Addresses: ${completePerson.getAllAddresses().length}`);\nconsole.log(`Employment: ${JSON.stringify(completePerson.getEmploymentInfo())}`);\n\n// Serialize different levels of completeness\nconst people = [minimalPerson, partialPerson, completePerson];\nconst peopleJson = S7e.serializeArray(people);\n\nconsole.log('\\nSerialization:');\nconsole.log(`Serialized ${people.length} people`);\nconsole.log(`JSON size: ${(peopleJson.length / 1024).toFixed(2)} KB`);\n\n// Deserialize and verify optional properties are handled correctly\nconst deserializedPeople = S7e.deserializeArray(Person, peopleJson);\n\nconsole.log('\\nDeserialization Verification:');\ndeserializedPeople.forEach((person, index) => {\n  console.log(`\\nPerson ${index + 1}: ${person.name}`);\n  console.log(`  Contact emails: ${person.contact.getAllEmails().length}`);\n  console.log(`  Phone numbers: ${person.contact.getAllPhones().length}`);\n  console.log(`  Addresses: ${person.getAllAddresses().length}`);\n  console.log(`  Home address: ${person.homeAddress ? 'Yes' : 'No'}`);\n  console.log(`  Work address: ${person.workAddress ? 'Yes' : 'No'}`);\n  console.log(`  Employment info: ${person.getEmploymentInfo() ? 'Yes' : 'No'}`);\n  console.log(`  Emergency contact: ${person.contact.emergencyContact ? 'Yes' : 'No'}`);\n  \n  // Verify instances\n  console.log(`  Contact is ContactInfo: ${person.contact instanceof ContactInfo}`);\n  if (person.homeAddress) {\n    console.log(`  Home address is Address: ${person.homeAddress instanceof Address}`);\n  }\n  if (person.dateOfBirth) {\n    console.log(`  Birth date is Date: ${person.dateOfBirth instanceof Date}`);\n  }\n});\n```\n\n## Optional Arrays and Collections\n\nHandling optional arrays and collections with graceful fallbacks.\n\n```typescript\n@JsonClass({ name: 'SocialMediaPost' })\nclass SocialMediaPost {\n  @JsonProperty({ name: 'id', type: String })\n  public id: string;\n\n  @JsonProperty({ name: 'content', type: String })\n  public content: string;\n\n  @JsonProperty({ name: 'author', type: String })\n  public author: string;\n\n  @JsonProperty({ name: 'createdAt', type: Date })\n  public createdAt: Date;\n\n  // Optional arrays\n  @JsonProperty({ name: 'tags', type: [String], optional: true })\n  public tags?: string[];\n\n  @JsonProperty({ name: 'mentions', type: [String], optional: true })\n  public mentions?: string[];\n\n  @JsonProperty({ name: 'attachments', type: [String], optional: true })\n  public attachments?: string[]; // URLs to images, videos, etc.\n\n  @JsonProperty({ name: 'likes', type: [String], optional: true })\n  public likes?: string[]; // User IDs who liked\n\n  @JsonProperty({ name: 'comments', type: [Object], optional: true })\n  public comments?: Array<{\n    id: string;\n    author: string;\n    content: string;\n    createdAt: string;\n  }>;\n\n  // Optional metadata\n  @JsonProperty({ name: 'location', type: Object, optional: true })\n  public location?: {\n    name: string;\n    coordinates: { lat: number; lng: number };\n  };\n\n  @JsonProperty({ name: 'analytics', type: Object, optional: true })\n  public analytics?: {\n    views: number;\n    shares: number;\n    clickThroughs: number;\n    engagement: number;\n  };\n\n  constructor(id: string, content: string, author: string) {\n    this.id = id;\n    this.content = content;\n    this.author = author;\n    this.createdAt = new Date();\n  }\n\n  // Safe accessors for optional arrays\n  public getTags(): string[] {\n    return this.tags || [];\n  }\n\n  public getMentions(): string[] {\n    return this.mentions || [];\n  }\n\n  public getAttachments(): string[] {\n    return this.attachments || [];\n  }\n\n  public getLikes(): string[] {\n    return this.likes || [];\n  }\n\n  public getComments(): Array<{ id: string; author: string; content: string; createdAt: string }> {\n    return this.comments || [];\n  }\n\n  // Utility methods\n  public addTag(tag: string): void {\n    if (!this.tags) this.tags = [];\n    if (!this.tags.includes(tag)) {\n      this.tags.push(tag);\n    }\n  }\n\n  public addMention(username: string): void {\n    if (!this.mentions) this.mentions = [];\n    if (!this.mentions.includes(username)) {\n      this.mentions.push(username);\n    }\n  }\n\n  public addAttachment(url: string): void {\n    if (!this.attachments) this.attachments = [];\n    this.attachments.push(url);\n  }\n\n  public addLike(userId: string): void {\n    if (!this.likes) this.likes = [];\n    if (!this.likes.includes(userId)) {\n      this.likes.push(userId);\n    }\n  }\n\n  public removeLike(userId: string): void {\n    if (!this.likes) return;\n    const index = this.likes.indexOf(userId);\n    if (index >= 0) {\n      this.likes.splice(index, 1);\n    }\n  }\n\n  public addComment(comment: { id: string; author: string; content: string }): void {\n    if (!this.comments) this.comments = [];\n    this.comments.push({\n      ...comment,\n      createdAt: new Date().toISOString()\n    });\n  }\n\n  public getLikeCount(): number {\n    return this.getLikes().length;\n  }\n\n  public getCommentCount(): number {\n    return this.getComments().length;\n  }\n\n  public hasAttachments(): boolean {\n    return this.getAttachments().length > 0;\n  }\n\n  public getEngagementScore(): number {\n    if (this.analytics) {\n      return this.analytics.engagement;\n    }\n    // Calculate basic engagement if analytics not available\n    return this.getLikeCount() * 1 + this.getCommentCount() * 2;\n  }\n\n  public setLocation(name: string, lat: number, lng: number): void {\n    this.location = {\n      name,\n      coordinates: { lat, lng }\n    };\n  }\n\n  public setAnalytics(views: number, shares: number, clickThroughs: number): void {\n    const engagement = (shares * 3 + this.getLikeCount() * 1 + this.getCommentCount() * 2 + clickThroughs * 1.5);\n    this.analytics = {\n      views,\n      shares,\n      clickThroughs,\n      engagement\n    };\n  }\n}\n\n// Create posts with varying levels of optional content\n\n// Minimal post (only required fields)\nconst minimalPost = new SocialMediaPost('post1', 'Hello, world!', 'user123');\n\nconsole.log('Minimal Post:');\nconsole.log(`Content: ${minimalPost.content}`);\nconsole.log(`Tags: ${minimalPost.getTags().length}`);\nconsole.log(`Likes: ${minimalPost.getLikeCount()}`);\nconsole.log(`Engagement: ${minimalPost.getEngagementScore()}`);\n\n// Post with some optional content\nconst partialPost = new SocialMediaPost('post2', 'Check out this amazing sunset! 🌅', 'user456');\npartialPost.addTag('sunset');\npartialPost.addTag('photography');\npartialPost.addTag('nature');\npartialPost.addMention('user789');\npartialPost.addAttachment('https://example.com/images/sunset.jpg');\npartialPost.addLike('user101');\npartialPost.addLike('user102');\npartialPost.addLike('user103');\npartialPost.setLocation('Golden Gate Bridge', 37.8199, -122.4783);\n\nconsole.log('\\nPartial Post:');\nconsole.log(`Content: ${partialPost.content}`);\nconsole.log(`Tags: ${partialPost.getTags().join(', ')}`);\nconsole.log(`Mentions: ${partialPost.getMentions().join(', ')}`);\nconsole.log(`Attachments: ${partialPost.hasAttachments()}`);\nconsole.log(`Likes: ${partialPost.getLikeCount()}`);\nconsole.log(`Location: ${partialPost.location?.name}`);\nconsole.log(`Engagement: ${partialPost.getEngagementScore()}`);\n\n// Post with full optional content\nconst completePost = new SocialMediaPost('post3', 'Excited to share our latest product launch! 🚀', 'company_official');\ncompletePost.addTag('product');\ncompletePost.addTag('launch');\ncompletePost.addTag('technology');\ncompletePost.addTag('innovation');\ncompletePost.addMention('tech_blogger');\ncompletePost.addMention('industry_expert');\ncompletePost.addAttachment('https://example.com/videos/product-demo.mp4');\ncompletePost.addAttachment('https://example.com/images/product-hero.jpg');\ncompletePost.addAttachment('https://example.com/docs/press-release.pdf');\n\n// Add multiple likes\nfor (let i = 1; i <= 25; i++) {\n  completePost.addLike(`user${i.toString().padStart(3, '0')}`);\n}\n\n// Add comments\ncompletePost.addComment({\n  id: 'comment1',\n  author: 'excited_user',\n  content: 'This looks amazing! Can\\'t wait to try it.'\n});\ncompletePost.addComment({\n  id: 'comment2',\n  author: 'tech_reviewer',\n  content: 'Great innovation! Looking forward to the detailed review.'\n});\ncompletePost.addComment({\n  id: 'comment3',\n  author: 'potential_customer',\n  content: 'When will this be available in my region?'\n});\n\ncompletePost.setLocation('Tech Conference Center', 37.7749, -122.4194);\ncompletePost.setAnalytics(1250, 45, 89);\n\nconsole.log('\\nComplete Post:');\nconsole.log(`Content: ${completePost.content}`);\nconsole.log(`Tags: ${completePost.getTags().length} (${completePost.getTags().join(', ')})`);\nconsole.log(`Mentions: ${completePost.getMentions().length}`);\nconsole.log(`Attachments: ${completePost.getAttachments().length}`);\nconsole.log(`Likes: ${completePost.getLikeCount()}`);\nconsole.log(`Comments: ${completePost.getCommentCount()}`);\nconsole.log(`Location: ${completePost.location?.name}`);\nif (completePost.analytics) {\n  console.log(`Analytics: ${completePost.analytics.views} views, ${completePost.analytics.shares} shares`);\n}\nconsole.log(`Engagement Score: ${completePost.getEngagementScore()}`);\n\n// Create array with mixed optional content\nconst posts = [minimalPost, partialPost, completePost];\n\n// Add one more post that starts minimal and gets content added\nconst growingPost = new SocialMediaPost('post4', 'Starting small...', 'user999');\nposts.push(growingPost);\n\nconsole.log('\\nPost Collection:');\nposts.forEach((post, index) => {\n  console.log(`Post ${index + 1}: ${post.getTags().length} tags, ${post.getLikeCount()} likes, ${post.getCommentCount()} comments`);\n});\n\n// Serialize all posts\nconst postsJson = S7e.serializeArray(posts);\nconsole.log(`\\nSerialized ${posts.length} posts`);\nconsole.log(`JSON size: ${(postsJson.length / 1024).toFixed(2)} KB`);\n\n// Deserialize and verify optional arrays are handled correctly\nconst deserializedPosts = S7e.deserializeArray(SocialMediaPost, postsJson);\n\nconsole.log('\\nDeserialization Verification:');\ndeserializedPosts.forEach((post, index) => {\n  console.log(`\\nPost ${index + 1} (${post.id}):`);\n  console.log(`  Content: ${post.content}`);\n  console.log(`  Tags array exists: ${post.tags !== undefined}, length: ${post.getTags().length}`);\n  console.log(`  Mentions array exists: ${post.mentions !== undefined}, length: ${post.getMentions().length}`);\n  console.log(`  Attachments array exists: ${post.attachments !== undefined}, length: ${post.getAttachments().length}`);\n  console.log(`  Likes array exists: ${post.likes !== undefined}, length: ${post.getLikeCount()}`);\n  console.log(`  Comments array exists: ${post.comments !== undefined}, length: ${post.getCommentCount()}`);\n  console.log(`  Location exists: ${post.location !== undefined}`);\n  console.log(`  Analytics exists: ${post.analytics !== undefined}`);\n  console.log(`  Created date is Date: ${post.createdAt instanceof Date}`);\n  \n  // Test that methods work after deserialization\n  console.log(`  Engagement score: ${post.getEngagementScore()}`);\n});\n\n// Test adding content to deserialized posts\nconsole.log('\\nTesting post-deserialization modifications:');\nconst firstPost = deserializedPosts[0];\nconsole.log(`Before: ${firstPost.getTags().length} tags, ${firstPost.getLikeCount()} likes`);\n\nfirstPost.addTag('retrospective');\nfirstPost.addLike('new_user_123');\nfirstPost.addComment({ id: 'late_comment', author: 'late_commenter', content: 'Better late than never!' });\n\nconsole.log(`After: ${firstPost.getTags().length} tags, ${firstPost.getLikeCount()} likes, ${firstPost.getCommentCount()} comments`);\nconsole.log(`New tag added: ${firstPost.getTags().includes('retrospective')}`);\nconsole.log(`New like added: ${firstPost.getLikes().includes('new_user_123')}`);\nconsole.log(`Comment added: ${firstPost.getComments().some(c => c.author === 'late_commenter')}`);\n```\n\n## Best Practices for Optional Properties\n\nRecommended patterns for working with optional properties effectively.\n\n```typescript\n@JsonClass({ name: 'ConfigurationSettings' })\nclass ConfigurationSettings {\n  // Required core settings\n  @JsonProperty({ name: 'appName', type: String })\n  public appName: string;\n\n  @JsonProperty({ name: 'version', type: String })\n  public version: string;\n\n  @JsonProperty({ name: 'environment', type: String })\n  public environment: string;\n\n  // Optional feature flags\n  @JsonProperty({ name: 'features', type: Object, optional: true })\n  public features?: {\n    enableBetaFeatures: boolean;\n    enableAnalytics: boolean;\n    enableNotifications: boolean;\n    enableAutoSave: boolean;\n  };\n\n  // Optional performance settings\n  @JsonProperty({ name: 'performance', type: Object, optional: true })\n  public performance?: {\n    maxConcurrentRequests: number;\n    requestTimeoutMs: number;\n    cacheExpiryMs: number;\n    enableCompression: boolean;\n  };\n\n  // Optional security settings\n  @JsonProperty({ name: 'security', type: Object, optional: true })\n  public security?: {\n    enableTwoFactor: boolean;\n    sessionTimeoutMinutes: number;\n    maxLoginAttempts: number;\n    requireStrongPasswords: boolean;\n  };\n\n  // Optional integrations\n  @JsonProperty({ name: 'integrations', type: [String], optional: true })\n  public integrations?: string[];\n\n  // Optional custom settings\n  @JsonProperty({ name: 'customSettings', type: Object, optional: true })\n  public customSettings?: Record<string, any>;\n\n  constructor(appName: string, version: string, environment: string) {\n    this.appName = appName;\n    this.version = version;\n    this.environment = environment;\n  }\n\n  // Safe accessors with defaults\n  public getFeatures() {\n    return this.features || {\n      enableBetaFeatures: false,\n      enableAnalytics: true,\n      enableNotifications: true,\n      enableAutoSave: true\n    };\n  }\n\n  public getPerformance() {\n    return this.performance || {\n      maxConcurrentRequests: 10,\n      requestTimeoutMs: 30000,\n      cacheExpiryMs: 300000,\n      enableCompression: true\n    };\n  }\n\n  public getSecurity() {\n    return this.security || {\n      enableTwoFactor: false,\n      sessionTimeoutMinutes: 60,\n      maxLoginAttempts: 5,\n      requireStrongPasswords: true\n    };\n  }\n\n  public getIntegrations(): string[] {\n    return this.integrations || [];\n  }\n\n  public getCustomSetting<T>(key: string, defaultValue: T): T {\n    if (!this.customSettings) return defaultValue;\n    return this.customSettings[key] !== undefined ? this.customSettings[key] : defaultValue;\n  }\n\n  // Configuration builders\n  public withFeatures(features: Partial<NonNullable<typeof this.features>>): this {\n    this.features = { ...this.getFeatures(), ...features };\n    return this;\n  }\n\n  public withPerformance(performance: Partial<NonNullable<typeof this.performance>>): this {\n    this.performance = { ...this.getPerformance(), ...performance };\n    return this;\n  }\n\n  public withSecurity(security: Partial<NonNullable<typeof this.security>>): this {\n    this.security = { ...this.getSecurity(), ...security };\n    return this;\n  }\n\n  public addIntegration(integration: string): this {\n    if (!this.integrations) this.integrations = [];\n    if (!this.integrations.includes(integration)) {\n      this.integrations.push(integration);\n    }\n    return this;\n  }\n\n  public setCustomSetting(key: string, value: any): this {\n    if (!this.customSettings) this.customSettings = {};\n    this.customSettings[key] = value;\n    return this;\n  }\n\n  // Validation methods\n  public isValid(): { valid: boolean; errors: string[] } {\n    const errors: string[] = [];\n\n    if (!this.appName.trim()) {\n      errors.push('App name cannot be empty');\n    }\n\n    if (!this.version.match(/^\\d+\\.\\d+\\.\\d+$/)) {\n      errors.push('Version must be in format x.y.z');\n    }\n\n    const validEnvironments = ['development', 'staging', 'production'];\n    if (!validEnvironments.includes(this.environment)) {\n      errors.push(`Environment must be one of: ${validEnvironments.join(', ')}`);\n    }\n\n    // Validate optional performance settings if present\n    if (this.performance) {\n      if (this.performance.maxConcurrentRequests < 1) {\n        errors.push('Max concurrent requests must be at least 1');\n      }\n      if (this.performance.requestTimeoutMs < 1000) {\n        errors.push('Request timeout must be at least 1000ms');\n      }\n    }\n\n    // Validate optional security settings if present\n    if (this.security) {\n      if (this.security.sessionTimeoutMinutes < 5) {\n        errors.push('Session timeout must be at least 5 minutes');\n      }\n      if (this.security.maxLoginAttempts < 1) {\n        errors.push('Max login attempts must be at least 1');\n      }\n    }\n\n    return { valid: errors.length === 0, errors };\n  }\n\n  // Merge configurations\n  public static merge(base: ConfigurationSettings, override: Partial<ConfigurationSettings>): ConfigurationSettings {\n    const merged = new ConfigurationSettings(\n      override.appName || base.appName,\n      override.version || base.version,\n      override.environment || base.environment\n    );\n\n    // Merge optional properties\n    if (base.features || override.features) {\n      merged.features = { ...base.getFeatures(), ...override.features };\n    }\n\n    if (base.performance || override.performance) {\n      merged.performance = { ...base.getPerformance(), ...override.performance };\n    }\n\n    if (base.security || override.security) {\n      merged.security = { ...base.getSecurity(), ...override.security };\n    }\n\n    if (base.integrations || override.integrations) {\n      merged.integrations = [...base.getIntegrations(), ...(override.integrations || [])];\n      // Remove duplicates\n      merged.integrations = [...new Set(merged.integrations)];\n    }\n\n    if (base.customSettings || override.customSettings) {\n      merged.customSettings = { ...base.customSettings, ...override.customSettings };\n    }\n\n    return merged;\n  }\n}\n\n// Example usage demonstrating best practices\n\n// Create base configuration with minimal required settings\nconst baseConfig = new ConfigurationSettings('MyApp', '1.0.0', 'development');\n\nconsole.log('Base Configuration:');\nconsole.log(`App: ${baseConfig.appName} v${baseConfig.version}`);\nconsole.log(`Environment: ${baseConfig.environment}`);\nconsole.log(`Features (default): ${JSON.stringify(baseConfig.getFeatures())}`);\nconsole.log(`Validation: ${JSON.stringify(baseConfig.isValid())}`);\n\n// Build configuration using fluent interface\nconst productionConfig = new ConfigurationSettings('MyApp', '1.2.3', 'production')\n  .withFeatures({\n    enableBetaFeatures: false,\n    enableAnalytics: true,\n    enableNotifications: true\n  })\n  .withPerformance({\n    maxConcurrentRequests: 50,\n    requestTimeoutMs: 15000,\n    enableCompression: true\n  })\n  .withSecurity({\n    enableTwoFactor: true,\n    sessionTimeoutMinutes: 30,\n    requireStrongPasswords: true\n  })\n  .addIntegration('google-analytics')\n  .addIntegration('stripe-payments')\n  .addIntegration('sendgrid-email')\n  .setCustomSetting('theme', 'dark')\n  .setCustomSetting('maxFileUploadSize', 10485760); // 10MB\n\nconsole.log('\\nProduction Configuration:');\nconsole.log(`App: ${productionConfig.appName} v${productionConfig.version}`);\nconsole.log(`Integrations: ${productionConfig.getIntegrations().join(', ')}`);\nconsole.log(`Custom theme: ${productionConfig.getCustomSetting('theme', 'light')}`);\nconsole.log(`Max upload size: ${productionConfig.getCustomSetting('maxFileUploadSize', 1048576)} bytes`);\nconsole.log(`Two-factor enabled: ${productionConfig.getSecurity().enableTwoFactor}`);\nconsole.log(`Validation: ${JSON.stringify(productionConfig.isValid())}`);\n\n// Test configuration merging\nconst overrides = {\n  features: { enableBetaFeatures: true },\n  performance: { maxConcurrentRequests: 100 },\n  integrations: ['slack-notifications']\n};\n\nconst mergedConfig = ConfigurationSettings.merge(productionConfig, overrides);\n\nconsole.log('\\nMerged Configuration:');\nconsole.log(`Beta features enabled: ${mergedConfig.getFeatures().enableBetaFeatures}`);\nconsole.log(`Max concurrent requests: ${mergedConfig.getPerformance().maxConcurrentRequests}`);\nconsole.log(`All integrations: ${mergedConfig.getIntegrations().join(', ')}`);\n\n// Test serialization/deserialization with optional properties\nconst configs = [baseConfig, productionConfig, mergedConfig];\nconst configsJson = S7e.serializeArray(configs);\n\nconsole.log(`\\nSerialized ${configs.length} configurations`);\nconsole.log(`JSON size: ${(configsJson.length / 1024).toFixed(2)} KB`);\n\nconst deserializedConfigs = S7e.deserializeArray(ConfigurationSettings, configsJson);\n\nconsole.log('\\nDeserialization Verification:');\ndeserializedConfigs.forEach((config, index) => {\n  console.log(`\\nConfig ${index + 1}:`);\n  console.log(`  App: ${config.appName}`);\n  console.log(`  Features object exists: ${config.features !== undefined}`);\n  console.log(`  Performance object exists: ${config.performance !== undefined}`);\n  console.log(`  Security object exists: ${config.security !== undefined}`);\n  console.log(`  Integrations array exists: ${config.integrations !== undefined}`);\n  console.log(`  Custom settings object exists: ${config.customSettings !== undefined}`);\n  console.log(`  Validation passes: ${config.isValid().valid}`);\n  \n  // Test that default getters work\n  console.log(`  Can get features: ${config.getFeatures().enableAnalytics}`);\n  console.log(`  Can get performance: ${config.getPerformance().maxConcurrentRequests}`);\n  console.log(`  Can get integrations: ${config.getIntegrations().length}`);\n});\n```\n\n## Next Steps\n\nThis guide covered comprehensive patterns for handling optional properties in S7E. Continue exploring:\n\n- [Custom Naming](/examples/custom-naming) - API integration and naming strategies\n- [Type Validation](/examples/type-validation) - Advanced validation patterns\n- [API Reference](/api/decorators) - Complete decorator documentation
