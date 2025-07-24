import { JsonProperty } from '../decorators/json-property';

/**
 * Test fixture that demonstrates using different JSON property names
 * than the class attribute names. This is particularly useful for:
 * - API compatibility (e.g., snake_case APIs vs camelCase TypeScript)
 * - Legacy system integration
 * - Minification-safe property names
 *
 * This fixture focuses purely on property name mapping without
 * non-serializable attributes to keep tests focused and simple.
 */
export class Product {

  @JsonProperty({ name: 'product_id', type: String })
  public id: string;

  @JsonProperty({ name: 'product_name', type: String })
  public title: string;

  @JsonProperty({ name: 'unit_price', type: Number })
  public price: number;

  @JsonProperty({ name: 'is_available', type: Boolean })
  public inStock: boolean;

  @JsonProperty({ name: 'category_tags', type: [String] })
  public categories: string[];

  @JsonProperty({ name: 'description_text', type: String, optional: true })
  public description: string | undefined;

  constructor(
    id?: string,
    title?: string,
    price?: number,
    inStock?: boolean,
    categories?: string[],
    description?: string,
  ) {
    this.id = id ?? '';
    this.title = title ?? '';
    this.price = price ?? 0;
    this.inStock = inStock ?? false;
    this.categories = categories ?? [];
    this.description = description;
  }
}
