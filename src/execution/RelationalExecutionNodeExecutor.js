const { ExecutionNodeVisitor } = require('./ExecutionNodeVisitor');

/**
 * Executor for relational execution nodes
 */
class RelationalExecutionNodeExecutor extends ExecutionNodeVisitor {
  /**
   * Create a new RelationalExecutionNodeExecutor
   * @param {ExecutionState} executionState - The execution state
   * @param {Identity} identity - The identity of the executor
   */
  constructor(executionState, identity) {
    super();
    this.executionState = executionState;
    this.identity = identity;
  }

  /**
   * Visit an execution node
   * @param {ExecutionNode} node - The node to visit
   * @returns {Result} - The result of visiting the node
   */
  visit(node) {
    // Handle SQLExecutionNode
    if (node.constructor.name === 'SQLExecutionNode') {
      return this.visitSQLExecutionNode(node);
    }
    
    throw new Error(`Unsupported node type: ${node.constructor.name}`);
  }

  /**
   * Visit a SQLExecutionNode
   * @param {SQLExecutionNode} node - The SQLExecutionNode to visit
   * @returns {Result} - The result of visiting the node
   */
  visitSQLExecutionNode(node) {
    const relationalExecutor = this.executionState.getStoreExecutionState('Relational').getRelationalExecutor();
    return relationalExecutor.execute(node, this.identity, this.executionState);
  }
}

module.exports = {
  RelationalExecutionNodeExecutor
};
