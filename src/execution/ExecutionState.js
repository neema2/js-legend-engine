/**
 * Represents the state of an execution
 */
class ExecutionState {
  /**
   * Create a new ExecutionState
   * @param {Object} vars - The variables for the execution
   * @param {Object} templateFunctions - The template functions for the execution
   * @param {Array} storeExecutionStates - The store execution states
   */
  constructor(vars = {}, templateFunctions = {}, storeExecutionStates = []) {
    this.vars = vars;
    this.templateFunctions = templateFunctions;
    this.storeExecutionStates = storeExecutionStates;
    this.results = {};
    this.activities = [];
    this.inAllocation = false;
    this.realizeInMemory = false;
    this.execID = Math.random().toString(36).substring(2, 15);
    this.authId = null;
    this.requestContext = null;
    this.topSpan = null;
  }

  /**
   * Get a result by name
   * @param {string} name - The name of the result
   * @returns {Result} - The result
   */
  getResult(name) {
    return this.results[name];
  }

  /**
   * Add a result
   * @param {string} name - The name of the result
   * @param {Result} result - The result
   */
  addResult(name, result) {
    this.results[name] = result;
  }

  /**
   * Get all results
   * @returns {Object} - All results
   */
  getResults() {
    return this.results;
  }

  /**
   * Get a store execution state by type
   * @param {string} type - The type of the store
   * @returns {StoreExecutionState} - The store execution state
   */
  getStoreExecutionState(type) {
    return this.storeExecutionStates.find(state => state.getStoreType() === type);
  }

  /**
   * Set the auth user
   * @param {string} user - The auth user
   * @param {boolean} isAuthId - Whether the user is an auth ID
   */
  setAuthUser(user, isAuthId = true) {
    this.authId = user;
  }

  /**
   * Set the request context
   * @param {Object} requestContext - The request context
   */
  setRequestContext(requestContext) {
    this.requestContext = requestContext;
  }

  /**
   * Get the request context
   * @returns {Object} - The request context
   */
  getRequestContext() {
    return this.requestContext;
  }

  /**
   * Check if SQL should be logged with parameter values
   * @returns {boolean} - Whether SQL should be logged with parameter values
   */
  logSQLWithParamValues() {
    return true;
  }

  /**
   * Create a copy of this execution state
   * @returns {ExecutionState} - A copy of this execution state
   */
  copy() {
    const copy = new ExecutionState(this.vars, this.templateFunctions, this.storeExecutionStates);
    copy.results = { ...this.results };
    copy.activities = [...this.activities];
    copy.inAllocation = this.inAllocation;
    copy.realizeInMemory = this.realizeInMemory;
    copy.execID = this.execID;
    copy.authId = this.authId;
    copy.requestContext = this.requestContext;
    copy.topSpan = this.topSpan;
    return copy;
  }
}

module.exports = {
  ExecutionState
};
