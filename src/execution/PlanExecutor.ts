import { ExecutionState } from './ExecutionState';
import { RelationalExecutionNodeExecutor } from './RelationalExecutionNodeExecutor';
import { ConstantResult, Result } from './Result';
import { SingleExecutionPlan } from '../protocol/ExecutionPlan';
import { Identity } from '../types';

/**
 * Configuration for PlanExecutor
 */
export interface PlanExecutorConfig {
  isJavaCompilationAllowed?: boolean;
  extraExecutors?: any[];
  graphFetchExecutionConfiguration?: Record<string, any>;
  logSQLWithParamValues?: boolean;
}

/**
 * Executes execution plans
 */
export class PlanExecutor {
  private isJavaCompilationAllowed: boolean;
  private extraExecutors: any[];
  private graphFetchExecutionConfiguration: Record<string, any>;
  private logSQLWithParamValues: boolean;

  /**
   * Create a new PlanExecutor
   * @param config - The configuration for the executor
   */
  constructor(config: PlanExecutorConfig = {}) {
    this.isJavaCompilationAllowed = config.isJavaCompilationAllowed || false;
    this.extraExecutors = config.extraExecutors || [];
    this.graphFetchExecutionConfiguration = config.graphFetchExecutionConfiguration || {};
    this.logSQLWithParamValues = config.logSQLWithParamValues !== false;
  }

  /**
   * Execute a single execution plan
   * @param executionPlan - The execution plan to execute
   * @param vars - The variables for the execution
   * @param user - The user executing the plan
   * @param identity - The identity of the executor
   * @returns The result of the execution
   */
  async execute(
    executionPlan: SingleExecutionPlan,
    vars: Record<string, any> = {},
    user: string | null = null,
    identity: Identity | null = null
  ): Promise<Result> {
    // Convert vars to results
    const results: Record<string, Result> = {};
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
   * @param executionPlan - The execution plan
   * @param state - The execution state
   * @param identity - The identity of the executor
   * @param user - The user executing the plan
   */
  private setUpState(
    executionPlan: SingleExecutionPlan,
    state: ExecutionState,
    identity: Identity | null,
    user: string | null
  ): void {
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
   * @param executionPlan - The execution plan
   * @param vars - The variables for the execution
   * @returns The execution state
   */
  private buildDefaultExecutionState(
    executionPlan: SingleExecutionPlan,
    vars: Record<string, Result>
  ): ExecutionState {
    const storeExecutionStates = this.extraExecutors.map(executor => executor.buildStoreExecutionState());
    return new ExecutionState(
      vars,
      executionPlan.templateFunctions || {},
      storeExecutionStates
    );
  }

  /**
   * Create a new PlanExecutor builder
   * @returns The builder
   */
  static newPlanExecutorBuilder(): PlanExecutorBuilder {
    return new PlanExecutorBuilder();
  }
}

/**
 * Builder for PlanExecutor
 */
export class PlanExecutorBuilder {
  private _isJavaCompilationAllowed: boolean = true;
  private storeExecutors: any[] = [];
  private _graphFetchExecutionConfiguration: Record<string, any> = {};
  private _logSQLWithParamValues: boolean = true;

  /**
   * Set whether Java compilation is allowed
   * @param isJavaCompilationAllowed - Whether Java compilation is allowed
   * @returns This builder
   */
  isJavaCompilationAllowed(isJavaCompilationAllowed: boolean): PlanExecutorBuilder {
    this._isJavaCompilationAllowed = isJavaCompilationAllowed;
    return this;
  }

  /**
   * Set the store executors
   * @param storeExecutors - The store executors
   * @returns This builder
   */
  withStoreExecutors(...storeExecutors: any[]): PlanExecutorBuilder {
    this.storeExecutors.push(...storeExecutors);
    return this;
  }

  /**
   * Set the graph fetch execution configuration
   * @param graphFetchExecutionConfiguration - The graph fetch execution configuration
   * @returns This builder
   */
  withGraphFetchExecutionConfiguration(
    graphFetchExecutionConfiguration: Record<string, any>
  ): PlanExecutorBuilder {
    this._graphFetchExecutionConfiguration = graphFetchExecutionConfiguration;
    return this;
  }

  /**
   * Set whether SQL should be logged with parameter values
   * @param logSQLWithParamValues - Whether SQL should be logged with parameter values
   * @returns This builder
   */
  withLogSQLWithParamValues(logSQLWithParamValues: boolean): PlanExecutorBuilder {
    this._logSQLWithParamValues = logSQLWithParamValues;
    return this;
  }

  /**
   * Build the PlanExecutor
   * @returns The PlanExecutor
   */
  build(): PlanExecutor {
    return new PlanExecutor({
      isJavaCompilationAllowed: this._isJavaCompilationAllowed,
      extraExecutors: this.storeExecutors,
      graphFetchExecutionConfiguration: this._graphFetchExecutionConfiguration,
      logSQLWithParamValues: this._logSQLWithParamValues
    });
  }
}
