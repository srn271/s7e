import { S7e, JsonProperty } from './src';

// Example using the new [Type] syntax
class Product {
  @JsonProperty({ type: String })
  public name: string;

  @JsonProperty({ type: Number })
  public price: number;

  constructor(name?: string, price?: number) {
    this.name = name ?? '';
    this.price = price ?? 0;
  }
}

class ShoppingCart {
  @JsonProperty({ type: String })
  public customerName: string;

  @JsonProperty({ type: [Product] })
  public items: Product[];

  @JsonProperty({ type: [String] })
  public categories: string[];

  @JsonProperty({ type: [Number] })
  public discounts: number[];

  constructor() {
    this.customerName = '';
    this.items = [];
    this.categories = [];
    this.discounts = [];
  }
}

// Test the new syntax
const cart = new ShoppingCart();
cart.customerName = 'John Doe';
cart.items = [
  new Product('Laptop', 999.99),
  new Product('Mouse', 29.99)
];
cart.categories = ['Electronics', 'Computing'];
cart.discounts = [0.1, 0.05];

console.log('Original Cart:');
console.log(cart);

const json = S7e.serialize(cart);
console.log('\nSerialized JSON:');
console.log(json);

const restored = S7e.deserialize(json, ShoppingCart);
console.log('\nDeserialized Cart:');
console.log(restored);

console.log('\nType checks:');
console.log('restored instanceof ShoppingCart:', restored instanceof ShoppingCart);
console.log('restored.items[0] instanceof Product:', restored.items[0] instanceof Product);
console.log('Categories are strings:', restored.categories.every(cat => typeof cat === 'string'));
console.log('Discounts are numbers:', restored.discounts.every(disc => typeof disc === 'number'));
