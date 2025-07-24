export type ClassConstructor<T = any> = (new (...args: any[]) => T) | (abstract new (...args: any[]) => T);
