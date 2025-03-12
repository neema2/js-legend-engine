const { ExecutionState } = require('./ExecutionState');
const { RelationalExecutionNodeExecutor } = require('./RelationalExecutionNodeExecutor');
const { ConstantResult } = require('./Result');

/**
 * Executes execution plans
 */
class PlanExecutor {
  /**
   * Create a new PlanExecutor
   * @param {Object} config - The configuration for the executor
   */
  constructor(config = {}) {
    this.isJavaCompilationAllowed = config.isJavaCompilationAllowed || false;
    this.extraExecutors = config.extraExecutors || [];
    this.graphFetchExecutionConfiguration = config.graphFetchExecutionConfiguration || {};
    this.logSQLWithParamValues = config.logSQLWithParamValues !== false;
  }

  /**
   * Execute a single execution plan
   * @param {SingleExecutionPlan} executionPlan - The execution plan to execute
   * @param {Object} vars - The variables for the execution
   * @param {string} user - The user executing the plan
   * @param {Identity} identity - The identity of the executor
   * @returns {Result} - The result of the execution
   */
  async execute(executionPlan, vars = {}, user = null, identity = null) {
    // Convert vars to results
    const results = {};
    for (const [key, value] of Object.entries(vars)) {
      results[key] = new ConstantResult(value);
    }

    // Build the execution state
    const state = this.buildDefaultExecutionState(executionPlan, results);

    // Set up the state
    this.setUpState(executionPlan, state, identity, user);

    // Execute the plan
    const executor = new RelationalExecutionNodeExecutor(state, identity);
    return await executionPlan.rootExecutionNode.accept(executor);
  }

  /**
   * Set up the execution state
   * @param {SingleExecutionPlan} executionPlan - The execution plan
   * @param {ExecutionState} state - The execution state
   * @param {Identity} identity - The identity of the executor
   * @param {string} user - The user executing the plan
   */
  setUpState(executionPlan, state, identity, user) {
    if (executionPlan.authDependent) {
      state.setAuthUser(executionPlan.kerberos || user);
    }
    if (state.authId === null) {
      state.setAuthUser(identity ? identity.getName() : null, false);
    }
    if (state.getResult('userId') === null) {
      state.addResult('userId', new ConstantResult(state.authId));
    }
    if (state.getResult('execID') === null) {
      state.addResult('execID', new ConstantResult(state.execID));
    }
    state.addResult('referer', new ConstantResult(String(state.requestContext ? state.requestContext.referral : '').replace("'", "''")));
  }

  /**
   * Build the default execution state
   * @param {SingleExecutionPlan} executionPlan - The execution plan
   * @param {Object} vars - The variables for the execution
   * @returns {ExecutionState} - The execution state
   */
  buildDefaultExecutionState(executionPlan, vars) {
    const storeExecutionStates = this.extraExecutors.map(executor => executor.buildStoreExecutionState());
    return new ExecutionState(
      vars,
      executionPlan.templateFunctions || {},
      storeExecutionStates
    );
  }

  /**
   * Create a new PlanExecutor builder
   * @returns {PlanExecutorBuilder} - The builder
   */
  static newPlanExecutorBuilder() {
    return new PlanExecutorBuilder();
  }
}

/**
 * Builder for PlanExecutor
 */
class PlanExecutorBuilder {
  constructor() {
    this.isJavaCompilationAllowed = true;
    this.storeExecutors = [];
    this.graphFetchExecutionConfiguration = {};
    this.logSQLWithParamValues = true;
  }

  /**
   * Set whether Java compilation is allowed
   * @param {boolean} isJavaCompilationAllowed - Whether Java compilation is allowed
   * @returns {PlanExecutorBuilder} - This builder
   */
  isJavaCompilationAllowed(isJavaCompilationAllowed) {
    this.isJavaCompilationAllowed = isJavaCompilationAllowed;
    return this;
  }

  /**
   * Set the store executors
   * @param {...StoreExecutor} storeExecutors - The store executors
   * @returns {PlanExecutorBuilder} - This builder
   */
  withStoreExecutors(...storeExecutors) {
    this.storeExecutors.push(...storeExecutors);
    return this;
  }

  /**
   * Set the graph fetch execution configuration
   * @param {Object} graphFetchExecutionConfiguration - The graph fetch execution configuration
   * @returns {PlanExecutorBuilder} - This builder
   */
  withGraphFetchExecutionConfiguration(graphFetchExecutionConfiguration) {
    this.graphFetchExecutionConfiguration = graphFetchExecutionConfiguration;
    return this;
  }

  /**
   * Set whether SQL should be logged with parameter values
   * @param {boolean} logSQLWithParamValues - Whether SQL should be logged with parameter values
   * @returns {PlanExecutorBuilder} - This builder
   */
  withLogSQLWithParamValues(logSQLWithParamValues) {
    this.logSQLWithParamValues = logSQLWithParamValues;
    return this;
  }

  /**
   * Build the PlanExecutor
   * @returns {PlanExecutor} - The PlanExecutor
   */
  build() {
    return new PlanExecutor({
      isJavaCompilationAllowed: this.isJavaCompilationAllowed,
      extraExecutors: this.storeExecutors,
      graphFetchExecutionConfiguration: this.graphFetchExecutionConfiguration,
      logSQLWithParamValues: this.logSQLWithParamValues
    });
  }
}

module.exports = {
  PlanExecutor,
  PlanExecutorBuilder
};
