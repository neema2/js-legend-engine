/**
 * Base class for all results
 */
class Result {
  constructor() {
    this.activities = [];
  }

  /**
   * Close the result and release any resources
   */
  close() {
    // No-op in base class
  }

  /**
   * Realize the result in memory
   * @returns {Result} - The realized result
   */
  realizeInMemory() {
    return this;
  }
}

/**
 * A constant result
 */
class ConstantResult extends Result {
  /**
   * Create a new ConstantResult
   * @param {*} value - The value of the result
   */
  constructor(value) {
    super();
    this.value = value;
  }

  /**
   * Get the value of the result
   * @returns {*} - The value of the result
   */
  getValue() {
    return this.value;
  }
}

module.exports = {
  Result,
  ConstantResult
};
