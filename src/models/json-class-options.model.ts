/**
 * Interface representing options for a JSON class.
 * This interface is used to define the metadata for classes that are decorated with the `@JsonClass` decorator.
 */
export interface JsonClassOptions {

  /**
   * Name for the JSON class (mandatory)
   */
  name: string;

}
