import { JsonClass } from '../decorators/json-class';
import { JsonProperty } from '../decorators/json-property';

@JsonClass({ name: 'Product' })
export class Product {
  @JsonProperty({ name: 'productName', type: String })
  public name: string;

  @JsonProperty({ name: 'productPrice', type: Number })
  public price: number;

  constructor(name: string = '', price: number = 0) {
    this.name = name;
    this.price = price;
  }
}

@JsonClass({ name: 'User' })
export class TestUser {
  @JsonProperty({ name: 'userName', type: String })
  public name: string;

  constructor(name: string = '') {
    this.name = name;
  }
}
