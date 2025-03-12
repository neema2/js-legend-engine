import { ExecutionNode } from './ExecutionNode';

/**
 * Represents an execution plan that can be executed by the PlanExecutor
 */
export class ExecutionPlan {
  /**
   * Create a new ExecutionPlan
   * @param rootExecutionNode - The root execution node
   */
  constructor(public readonly rootExecutionNode: ExecutionNode) {}

  /**
   * Get a single execution plan with the given parameters
   * @param params - Parameters for the execution plan
   * @returns A single execution plan
   */
  getSingleExecutionPlan(params: Record<string, any>): SingleExecutionPlan {
    // In a real implementation, this would create a new plan with parameters applied
    // For simplicity, we'll just return this plan
    return new SingleExecutionPlan(this.rootExecutionNode);
  }
}

/**
 * Represents a single execution plan that can be executed by the PlanExecutor
 */
export class SingleExecutionPlan {
  /**
   * Template functions for the execution plan
   */
  public templateFunctions: Record<string, Function> = {};
  
  /**
   * Whether the execution plan is auth dependent
   */
  public authDependent?: boolean;
  
  /**
   * Kerberos information for the execution plan
   */
  public kerberos?: string;

  /**
   * Create a new SingleExecutionPlan
   * @param rootExecutionNode - The root execution node
   */
  constructor(public readonly rootExecutionNode: ExecutionNode) {}
}
