# Complex Objects

This guide demonstrates how to use S7E with complex object hierarchies, inheritance, and polymorphic serialization.

## Inheritance and Polymorphism

S7E supports polymorphic serialization with automatic type discrimination.

```typescript
import { S7e, JsonClass, JsonProperty } from 's7e';

// Base class
@JsonClass({ name: 'Shape' })
abstract class Shape {
  @JsonProperty({ name: 'id', type: String })
  public id: string;

  @JsonProperty({ name: 'color', type: String })
  public color: string;

  @JsonProperty({ name: 'position', type: Object })
  public position: { x: number; y: number };

  constructor(id: string, color: string, x: number = 0, y: number = 0) {
    this.id = id;
    this.color = color;
    this.position = { x, y };
  }

  abstract area(): number;
  abstract perimeter(): number;
}

// Circle implementation
@JsonClass({ name: 'Circle' })
class Circle extends Shape {
  @JsonProperty({ name: 'radius', type: Number })
  public radius: number;

  constructor(id: string, color: string, radius: number, x?: number, y?: number) {
    super(id, color, x, y);
    this.radius = radius;
  }

  area(): number {
    return Math.PI * this.radius * this.radius;
  }

  perimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

// Rectangle implementation
@JsonClass({ name: 'Rectangle' })
class Rectangle extends Shape {
  @JsonProperty({ name: 'width', type: Number })
  public width: number;

  @JsonProperty({ name: 'height', type: Number })
  public height: number;

  constructor(id: string, color: string, width: number, height: number, x?: number, y?: number) {
    super(id, color, x, y);
    this.width = width;
    this.height = height;
  }

  area(): number {
    return this.width * this.height;
  }

  perimeter(): number {
    return 2 * (this.width + this.height);
  }
}

// Triangle implementation
@JsonClass({ name: 'Triangle' })
class Triangle extends Shape {
  @JsonProperty({ name: 'base', type: Number })
  public base: number;

  @JsonProperty({ name: 'height', type: Number })
  public height: number;

  @JsonProperty({ name: 'sideA', type: Number })
  public sideA: number;

  @JsonProperty({ name: 'sideB', type: Number })
  public sideB: number;

  constructor(id: string, color: string, base: number, height: number, sideA: number, sideB: number, x?: number, y?: number) {
    super(id, color, x, y);
    this.base = base;
    this.height = height;
    this.sideA = sideA;
    this.sideB = sideB;
  }

  area(): number {
    return 0.5 * this.base * this.height;
  }

  perimeter(): number {
    return this.base + this.sideA + this.sideB;
  }
}

// Register types for polymorphic deserialization
S7e.registerTypes([Circle, Rectangle, Triangle]);

// Usage example
const shapes: Shape[] = [
  new Circle('circle1', 'red', 5, 10, 20),
  new Rectangle('rect1', 'blue', 10, 15, 30, 40),
  new Triangle('tri1', 'green', 8, 6, 7, 9, 50, 60)
];

console.log('Original shapes:');
shapes.forEach(shape => {
  console.log(`${shape.constructor.name}: Area = ${shape.area()}, Perimeter = ${shape.perimeter()}`);
});

// Serialize array of polymorphic objects
const shapesJson = S7e.serializeArray(shapes);
console.log('\\nSerialized JSON:', shapesJson);

// Deserialize back to correct types
const deserializedShapes = S7e.deserializeArray(Shape, shapesJson);
console.log('\\nDeserialized shapes:');
deserializedShapes.forEach(shape => {
  console.log(`${shape.constructor.name}: Area = ${shape.area()}, Perimeter = ${shape.perimeter()}`);
  console.log(`Type check - Circle: ${shape instanceof Circle}, Rectangle: ${shape instanceof Rectangle}, Triangle: ${shape instanceof Triangle}`);
});
```

## Nested Object Hierarchies

Complex nested structures with multiple levels of composition.

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

  @JsonProperty({ name: 'coordinates', type: Object, optional: true })
  public coordinates?: { latitude: number; longitude: number };

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
  @JsonProperty({ name: 'email', type: String })
  public email: string;

  @JsonProperty({ name: 'phone', type: String, optional: true })
  public phone?: string;

  @JsonProperty({ name: 'mobile', type: String, optional: true })
  public mobile?: string;

  @JsonProperty({ name: 'fax', type: String, optional: true })
  public fax?: string;

  @JsonProperty({ name: 'website', type: String, optional: true })
  public website?: string;

  constructor(email: string) {
    this.email = email;
  }
}

@JsonClass({ name: 'Department' })
class Department {
  @JsonProperty({ name: 'id', type: String })
  public id: string;

  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'description', type: String, optional: true })
  public description?: string;

  @JsonProperty({ name: 'budget', type: Number, optional: true })
  public budget?: number;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

@JsonClass({ name: 'Employee' })
class Employee {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'firstName', type: String })
  public firstName: string;

  @JsonProperty({ name: 'lastName', type: String })
  public lastName: string;

  @JsonProperty({ name: 'title', type: String })
  public title: string;

  @JsonProperty({ name: 'department', type: Department })
  public department: Department;

  @JsonProperty({ name: 'manager', type: Employee, optional: true })
  public manager?: Employee;

  @JsonProperty({ name: 'directReports', type: [Employee] })
  public directReports: Employee[];

  @JsonProperty({ name: 'contact', type: ContactInfo })
  public contact: ContactInfo;

  @JsonProperty({ name: 'address', type: Address })
  public address: Address;

  @JsonProperty({ name: 'salary', type: Number, optional: true })
  public salary?: number;

  @JsonProperty({ name: 'startDate', type: Date })
  public startDate: Date;

  @JsonProperty({ name: 'endDate', type: Date, optional: true })
  public endDate?: Date;

  @JsonProperty({ name: 'skills', type: [String] })
  public skills: string[];

  @JsonProperty({ name: 'projects', type: [String] })
  public projects: string[];

  constructor(
    id: number,
    firstName: string,
    lastName: string,
    title: string,
    department: Department,
    contact: ContactInfo,
    address: Address
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.title = title;
    this.department = department;
    this.contact = contact;
    this.address = address;
    this.directReports = [];
    this.startDate = new Date();
    this.skills = [];
    this.projects = [];
  }

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public addDirectReport(employee: Employee): void {
    if (!this.directReports.find(e => e.id === employee.id)) {
      this.directReports.push(employee);
      employee.manager = this;
    }
  }

  public removeDirectReport(employeeId: number): void {
    const index = this.directReports.findIndex(e => e.id === employeeId);
    if (index >= 0) {
      this.directReports[index].manager = undefined;
      this.directReports.splice(index, 1);
    }
  }

  public addSkill(skill: string): void {
    if (!this.skills.includes(skill)) {
      this.skills.push(skill);
    }
  }

  public addProject(project: string): void {
    if (!this.projects.includes(project)) {
      this.projects.push(project);
    }
  }
}

// Create complex organizational structure
const engineeringDept = new Department('eng', 'Engineering');
engineeringDept.description = 'Software development and engineering';
engineeringDept.budget = 2000000;

const marketingDept = new Department('mkt', 'Marketing');
marketingDept.description = 'Product marketing and communications';
marketingDept.budget = 500000;

// Create addresses
const johnAddress = new Address('123 Main St', 'San Francisco', 'CA', '94105');
johnAddress.coordinates = { latitude: 37.7749, longitude: -122.4194 };

const janeAddress = new Address('456 Oak Ave', 'Palo Alto', 'CA', '94301');
janeAddress.coordinates = { latitude: 37.4419, longitude: -122.1430 };

const bobAddress = new Address('789 Pine St', 'Mountain View', 'CA', '94041');

// Create contact info
const johnContact = new ContactInfo('john.doe@company.com');
johnContact.phone = '555-0123';
johnContact.mobile = '555-0124';

const janeContact = new ContactInfo('jane.smith@company.com');
janeContact.mobile = '555-0125';

const bobContact = new ContactInfo('bob.johnson@company.com');
bobContact.phone = '555-0126';

// Create employees
const cto = new Employee(1, 'John', 'Doe', 'CTO', engineeringDept, johnContact, johnAddress);
cto.salary = 200000;
cto.addSkill('Leadership');
cto.addSkill('Architecture');
cto.addSkill('Strategy');
cto.addProject('Platform Modernization');
cto.addProject('Team Scaling');

const seniorDev = new Employee(2, 'Jane', 'Smith', 'Senior Developer', engineeringDept, janeContact, janeAddress);
seniorDev.salary = 150000;
seniorDev.addSkill('TypeScript');
seniorDev.addSkill('React');
seniorDev.addSkill('Node.js');
seniorDev.addProject('Frontend Redesign');
seniorDev.addProject('API Development');

const juniorDev = new Employee(3, 'Bob', 'Johnson', 'Junior Developer', engineeringDept, bobContact, bobAddress);
juniorDev.salary = 90000;
juniorDev.addSkill('JavaScript');
juniorDev.addSkill('HTML/CSS');
juniorDev.addProject('Bug Fixes');
juniorDev.addProject('Documentation');

// Build hierarchy
cto.addDirectReport(seniorDev);
seniorDev.addDirectReport(juniorDev);

console.log('Organization Structure:');
console.log(`${cto.getFullName()} (${cto.title})`);
console.log(`  Department: ${cto.department.name}`);
console.log(`  Address: ${cto.address.getFullAddress()}`);
console.log(`  Skills: ${cto.skills.join(', ')}`);
console.log(`  Direct Reports: ${cto.directReports.length}`);

cto.directReports.forEach(report => {
  console.log(`    ${report.getFullName()} (${report.title})`);
  console.log(`      Skills: ${report.skills.join(', ')}`);
  console.log(`      Projects: ${report.projects.join(', ')}`);

  if (report.directReports.length > 0) {
    report.directReports.forEach(subReport => {
      console.log(`      └─ ${subReport.getFullName()} (${subReport.title})`);
    });
  }
});

// Serialize the entire organization
const orgJson = S7e.serialize(cto);
console.log('\\nSerialized organization size:', orgJson.length, 'characters');

// Deserialize back to objects
const deserializedCto = S7e.deserialize(Employee, orgJson);
console.log('\\nDeserialized CTO:', deserializedCto.getFullName());
console.log('Manager check:', deserializedCto.directReports[0].manager?.getFullName());
console.log('Nested manager check:', deserializedCto.directReports[0].directReports[0].manager?.getFullName());

// Verify complex relationships are preserved
const deserializedSeniorDev = deserializedCto.directReports[0];
const deserializedJuniorDev = deserializedSeniorDev.directReports[0];

console.log('\\nRelationship verification:');
console.log('CTO has senior dev as direct report:', deserializedCto.directReports.includes(deserializedSeniorDev));
console.log('Senior dev has CTO as manager:', deserializedSeniorDev.manager === deserializedCto);
console.log('Junior dev has senior dev as manager:', deserializedJuniorDev.manager === deserializedSeniorDev);

// Verify all nested objects are correct instances
console.log('\\nInstance checks:');
console.log('CTO is Employee:', deserializedCto instanceof Employee);
console.log('Department is Department:', deserializedCto.department instanceof Department);
console.log('Contact is ContactInfo:', deserializedCto.contact instanceof ContactInfo);
console.log('Address is Address:', deserializedCto.address instanceof Address);
```

## Composition Patterns

Examples showing different composition patterns and how S7E handles them.

```typescript
// Component-based architecture
@JsonClass({ name: 'Transform' })
class Transform {
  @JsonProperty({ name: 'position', type: Object })
  public position: { x: number; y: number; z: number };

  @JsonProperty({ name: 'rotation', type: Object })
  public rotation: { x: number; y: number; z: number };

  @JsonProperty({ name: 'scale', type: Object })
  public scale: { x: number; y: number; z: number };

  constructor() {
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { x: 1, y: 1, z: 1 };
  }
}

@JsonClass({ name: 'Material' })
class Material {
  @JsonProperty({ name: 'color', type: String })
  public color: string;

  @JsonProperty({ name: 'texture', type: String, optional: true })
  public texture?: string;

  @JsonProperty({ name: 'opacity', type: Number })
  public opacity: number;

  @JsonProperty({ name: 'metallic', type: Number })
  public metallic: number;

  @JsonProperty({ name: 'roughness', type: Number })
  public roughness: number;

  constructor(color: string = '#ffffff') {
    this.color = color;
    this.opacity = 1.0;
    this.metallic = 0.0;
    this.roughness = 0.5;
  }
}

@JsonClass({ name: 'Mesh' })
class Mesh {
  @JsonProperty({ name: 'vertices', type: [Number] })
  public vertices: number[];

  @JsonProperty({ name: 'indices', type: [Number] })
  public indices: number[];

  @JsonProperty({ name: 'normals', type: [Number] })
  public normals: number[];

  @JsonProperty({ name: 'uvs', type: [Number], optional: true })
  public uvs?: number[];

  constructor() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
  }
}

@JsonClass({ name: 'GameObject' })
class GameObject {
  @JsonProperty({ name: 'id', type: String })
  public id: string;

  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'active', type: Boolean })
  public active: boolean;

  @JsonProperty({ name: 'transform', type: Transform })
  public transform: Transform;

  @JsonProperty({ name: 'material', type: Material, optional: true })
  public material?: Material;

  @JsonProperty({ name: 'mesh', type: Mesh, optional: true })
  public mesh?: Mesh;

  @JsonProperty({ name: 'children', type: [GameObject] })
  public children: GameObject[];

  @JsonProperty({ name: 'parent', type: GameObject, optional: true })
  public parent?: GameObject;

  @JsonProperty({ name: 'tags', type: [String] })
  public tags: string[];

  @JsonProperty({ name: 'metadata', type: Object, optional: true })
  public metadata?: Record<string, any>;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.active = true;
    this.transform = new Transform();
    this.children = [];
    this.tags = [];
  }

  public addChild(child: GameObject): void {
    if (!this.children.includes(child)) {
      this.children.push(child);
      child.parent = this;
    }
  }

  public removeChild(child: GameObject): void {
    const index = this.children.indexOf(child);
    if (index >= 0) {
      this.children.splice(index, 1);
      child.parent = undefined;
    }
  }

  public addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  public hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  public findChildByName(name: string): GameObject | undefined {
    return this.children.find(child => child.name === name);
  }

  public findChildrenWithTag(tag: string): GameObject[] {
    return this.children.filter(child => child.hasTag(tag));
  }

  public getAllDescendants(): GameObject[] {
    const descendants: GameObject[] = [];

    function collectDescendants(obj: GameObject) {
      for (const child of obj.children) {
        descendants.push(child);
        collectDescendants(child);
      }
    }

    collectDescendants(this);
    return descendants;
  }
}

// Create a complex scene hierarchy
const scene = new GameObject('scene', 'Main Scene');

// Create a car with wheels
const car = new GameObject('car', 'Sports Car');
car.addTag('vehicle');
car.addTag('interactive');
car.transform.position = { x: 0, y: 0, z: 0 };
car.material = new Material('#ff0000');
car.material.metallic = 0.8;
car.material.roughness = 0.2;

// Create wheels
const wheelPositions = [
  { name: 'Front Left Wheel', pos: { x: -1, y: -0.5, z: 1 } },
  { name: 'Front Right Wheel', pos: { x: 1, y: -0.5, z: 1 } },
  { name: 'Rear Left Wheel', pos: { x: -1, y: -0.5, z: -1 } },
  { name: 'Rear Right Wheel', pos: { x: 1, y: -0.5, z: -1 } }
];

wheelPositions.forEach(wheelData => {
  const wheel = new GameObject(`wheel_${wheelData.name.replace(/\\s/g, '_').toLowerCase()}`, wheelData.name);
  wheel.addTag('wheel');
  wheel.addTag('rotating');
  wheel.transform.position = wheelData.pos;
  wheel.material = new Material('#333333');
  wheel.material.metallic = 0.1;
  wheel.material.roughness = 0.8;
  car.addChild(wheel);
});

// Create environment objects
const ground = new GameObject('ground', 'Ground Plane');
ground.addTag('environment');
ground.addTag('static');
ground.transform.scale = { x: 100, y: 1, z: 100 };
ground.material = new Material('#654321');
ground.material.roughness = 0.9;

const building = new GameObject('building', 'Office Building');
building.addTag('environment');
building.addTag('static');
building.transform.position = { x: 10, y: 0, z: 10 };
building.transform.scale = { x: 5, y: 20, z: 5 };
building.material = new Material('#cccccc');

// Create building details
const windows = new GameObject('windows', 'Building Windows');
windows.addTag('detail');
windows.material = new Material('#87ceeb');
windows.material.opacity = 0.7;
building.addChild(windows);

const door = new GameObject('door', 'Main Entrance');
door.addTag('interactive');
door.addTag('door');
door.transform.position = { x: 0, y: 0, z: 2.5 };
door.material = new Material('#8b4513');
building.addChild(door);

// Add everything to scene
scene.addChild(ground);
scene.addChild(car);
scene.addChild(building);

// Add metadata
scene.metadata = {
  version: '1.0',
  created: new Date().toISOString(),
  author: 'Scene Builder',
  description: 'A simple car and building scene'
};

console.log('Scene Structure:');
console.log(`Scene: ${scene.name}`);
console.log(`Total objects in scene: ${scene.getAllDescendants().length + 1}`);

function printHierarchy(obj: GameObject, indent: string = '') {
  console.log(`${indent}${obj.name} [${obj.tags.join(', ')}]`);
  obj.children.forEach(child => {
    printHierarchy(child, indent + '  ');
  });
}

printHierarchy(scene);

// Find objects by tag
const vehicles = scene.getAllDescendants().filter(obj => obj.hasTag('vehicle'));
const wheels = scene.getAllDescendants().filter(obj => obj.hasTag('wheel'));
const interactive = scene.getAllDescendants().filter(obj => obj.hasTag('interactive'));

console.log(`\\nVehicles: ${vehicles.length}`);
console.log(`Wheels: ${wheels.length}`);
console.log(`Interactive objects: ${interactive.length}`);

// Serialize the entire scene
const sceneJson = S7e.serialize(scene);
console.log(`\\nSerialized scene size: ${sceneJson.length} characters`);

// Deserialize and verify
const deserializedScene = S7e.deserialize(GameObject, sceneJson);
console.log(`\\nDeserialized scene: ${deserializedScene.name}`);
console.log(`Total objects after deserialization: ${deserializedScene.getAllDescendants().length + 1}`);

// Verify relationships
const deserializedCar = deserializedScene.findChildByName('Sports Car');
const deserializedWheels = deserializedCar?.findChildrenWithTag('wheel') || [];
console.log(`Car found: ${deserializedCar ? 'Yes' : 'No'}`);
console.log(`Wheels attached to car: ${deserializedWheels.length}`);

// Verify parent-child relationships
const firstWheel = deserializedWheels[0];
if (firstWheel) {
  console.log(`First wheel parent is car: ${firstWheel.parent === deserializedCar}`);
}

// Verify all instances are correct
console.log(`\\nInstance verification:`);
console.log(`Scene is GameObject: ${deserializedScene instanceof GameObject}`);
console.log(`Scene transform is Transform: ${deserializedScene.transform instanceof Transform}`);
if (deserializedCar?.material) {
  console.log(`Car material is Material: ${deserializedCar.material instanceof Material}`);
}
```

## Next Steps

These examples demonstrate S7E's powerful capabilities with complex object structures. Continue exploring:

- [Array Handling](/examples/arrays) - Advanced array patterns
- [Optional Properties](/examples/optional-properties) - Flexible data structures
- [Custom Naming](/examples/custom-naming) - API integration patterns
