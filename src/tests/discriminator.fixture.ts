import { JsonClass } from '../decorators/json-class';
import { JsonProperty } from '../decorators/json-property';

@JsonClass({ name: 'Shape' })
export abstract class Shape {
  @JsonProperty({ name: 'id', type: String })
  public id: string;

  constructor(id: string = '') {
    this.id = id;
  }
}

@JsonClass({ name: 'Circle' })
export class Circle extends Shape {
  @JsonProperty({ name: 'radius', type: Number })
  public radius: number;

  constructor(id: string = '', radius: number = 0) {
    super(id);
    this.radius = radius;
  }
}

@JsonClass({ name: 'Rectangle' })
export class Rectangle extends Shape {
  @JsonProperty({ name: 'width', type: Number })
  public width: number;

  @JsonProperty({ name: 'height', type: Number })
  public height: number;

  constructor(id: string = '', width: number = 0, height: number = 0) {
    super(id);
    this.width = width;
    this.height = height;
  }
}

@JsonClass({ name: 'Vehicle' })
export abstract class Vehicle {
  @JsonProperty({ name: 'brand', type: String })
  public brand: string;

  constructor(brand: string = '') {
    this.brand = brand;
  }
}

@JsonClass({ name: 'Car' })
export class Car extends Vehicle {
  @JsonProperty({ name: 'doors', type: Number })
  public doors: number;

  constructor(brand: string = '', doors: number = 4) {
    super(brand);
    this.doors = doors;
  }
}

@JsonClass({ name: 'Motorcycle' })
export class Motorcycle extends Vehicle {
  @JsonProperty({ name: 'engineSize', type: Number })
  public engineSize: number;

  constructor(brand: string = '', engineSize: number = 250) {
    super(brand);
    this.engineSize = engineSize;
  }
}
