/**
 * Base class for all results
 */
export abstract class Result {
  public activities: any[] = [];

  /**
   * Close the result and release any resources
   */
  close(): void {
    // No-op in base class
  }

  /**
   * Realize the result in memory
   * @returns The realized result
   */
  realizeInMemory(): Result {
    return this;
  }
}

/**
 * A constant result
 */
export class ConstantResult extends Result {
  /**
   * Create a new ConstantResult
   * @param value - The value of the result
   */
  constructor(private readonly value: any) {
    super();
  }

  /**
   * Get the value of the result
   * @returns The value of the result
   */
  getValue(): any {
    return this.value;
  }
}
