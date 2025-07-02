// Serialize a class instance to JSON string
export function serialize<T>(instance: T): string {
  return JSON.stringify(instance);
}

// Deserialize a JSON string to a class instance
export function deserialize<T extends object>(cls: { new (...args: any[]): T }, json: string): T {
  return Object.assign(new cls() as object, JSON.parse(json)) as T;
}
