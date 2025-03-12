import { Result } from './Result';
import { RequestContext, StoreExecutionState } from '../types';

/**
 * Represents the state of an execution
 */
export class ExecutionState {
  public results: Record<string, Result> = {};
  public activities: any[] = [];
  public inAllocation: boolean = false;
  public realizeInMemory: boolean = false;
  public execID: string;
  public authId: string | null = null;
  public requestContext: RequestContext | null = null;
  public topSpan: any | null = null;

  /**
   * Create a new ExecutionState
   * @param vars - The variables for the execution
   * @param templateFunctions - The template functions for the execution
   * @param storeExecutionStates - The store execution states
   */
  constructor(
    public readonly vars: Record<string, any> = {},
    public readonly templateFunctions: Record<string, Function> = {},
    public readonly storeExecutionStates: StoreExecutionState[] = []
  ) {
    this.execID = Math.random().toString(36).substring(2, 15);
  }

  /**
   * Get a result by name
   * @param name - The name of the result
   * @returns The result
   */
  getResult(name: string): Result | null {
    return this.results[name] || null;
  }

  /**
   * Add a result
   * @param name - The name of the result
   * @param result - The result
   */
  addResult(name: string, result: Result): void {
    this.results[name] = result;
  }

  /**
   * Get all results
   * @returns All results
   */
  getResults(): Record<string, Result> {
    return this.results;
  }

  /**
   * Get a store execution state by type
   * @param type - The type of the store
   * @returns The store execution state
   */
  getStoreExecutionState(type: string): StoreExecutionState | undefined {
    return this.storeExecutionStates.find(state => state.getStoreType() === type);
  }

  /**
   * Set the auth user
   * @param user - The auth user
   * @param isAuthId - Whether the user is an auth ID
   */
  setAuthUser(user: string | null, isAuthId: boolean = true): void {
    this.authId = user;
  }

  /**
   * Set the request context
   * @param requestContext - The request context
   */
  setRequestContext(requestContext: RequestContext): void {
    this.requestContext = requestContext;
  }

  /**
   * Get the request context
   * @returns The request context
   */
  getRequestContext(): RequestContext | null {
    return this.requestContext;
  }

  /**
   * Check if SQL should be logged with parameter values
   * @returns Whether SQL should be logged with parameter values
   */
  logSQLWithParamValues(): boolean {
    return true;
  }

  /**
   * Create a copy of this execution state
   * @returns A copy of this execution state
   */
  copy(): ExecutionState {
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
