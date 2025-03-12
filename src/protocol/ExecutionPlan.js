/**
 * Represents an execution plan that can be executed by the PlanExecutor
 */
class ExecutionPlan {
  constructor(rootExecutionNode) {
    this.rootExecutionNode = rootExecutionNode;
  }

  /**
   * Get a single execution plan with the given parameters
   * @param {Object} params - Parameters for the execution plan
   * @returns {SingleExecutionPlan} - A single execution plan
   */
  getSingleExecutionPlan(params) {
    // In a real implementation, this would create a new plan with parameters applied
    // For simplicity, we'll just return this plan
    return new SingleExecutionPlan(this.rootExecutionNode);
  }
}

/**
 * Represents a single execution plan that can be executed by the PlanExecutor
 */
class SingleExecutionPlan {
  constructor(rootExecutionNode) {
    this.rootExecutionNode = rootExecutionNode;
    this.templateFunctions = {};
  }
}

module.exports = {
  ExecutionPlan,
  SingleExecutionPlan
};
