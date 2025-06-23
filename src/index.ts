// Serialize a class instance to JSON string
export function serialize<T>(instance: T): string {
  return JSON.stringify(instance);
}

// Deserialize a JSON string to a class instance
export function deserialize<T>(cls: { new (...args: any[]): T }, json: string): T {
  const obj = JSON.parse(json);
  return Object.assign(Object.create(cls.prototype), obj) as T;
}
