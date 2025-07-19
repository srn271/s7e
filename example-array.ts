import { S7e, JsonProperty } from './src';

// Example classes demonstrating array support
class Tag {
  @JsonProperty({ type: String })
  public name: string;

  @JsonProperty({ type: String })
  public color: string;

  constructor(name?: string, color?: string) {
    this.name = name ?? '';
    this.color = color ?? 'blue';
  }
}

class BlogPost {
  @JsonProperty({ type: String })
  public title: string;

  @JsonProperty({ type: String })
  public content: string;

  @JsonProperty({ arrayOf: String })
  public categories: string[];

  @JsonProperty({ arrayOf: Number })
  public ratings: number[];

  @JsonProperty({ arrayOf: Tag })
  public tags: Tag[];

  @JsonProperty({ arrayOf: String, optional: true })
  public comments?: string[];

  constructor() {
    this.title = '';
    this.content = '';
    this.categories = [];
    this.ratings = [];
    this.tags = [];
  }
}

// Create a sample blog post
const post = new BlogPost();
post.title = 'Array Support in S7e';
post.content = 'This demonstrates the new array functionality';
post.categories = ['programming', 'typescript'];
post.ratings = [5, 4, 5, 3, 4];
post.tags = [
  new Tag('serialization', 'green'),
  new Tag('arrays', 'purple'),
  new Tag('typescript', 'blue')
];

console.log('Original BlogPost:');
console.log(post);
console.log();

// Serialize
const json = S7e.serialize(post);
console.log('Serialized JSON:');
console.log(json);
console.log();

// Deserialize
const restored = S7e.deserialize(json, BlogPost);
console.log('Deserialized BlogPost:');
console.log(restored);
console.log();

// Verify instance types
console.log('Type checks:');
console.log('restored instanceof BlogPost:', restored instanceof BlogPost);
console.log('restored.tags[0] instanceof Tag:', restored.tags[0] instanceof Tag);
console.log('All tags are Tag instances:', restored.tags.every(tag => tag instanceof Tag));
console.log();

// Test array elements
console.log('Array contents verification:');
console.log('Categories:', restored.categories);
console.log('Ratings:', restored.ratings);
console.log('Tags:', restored.tags.map(tag => `${tag.name} (${tag.color})`));
