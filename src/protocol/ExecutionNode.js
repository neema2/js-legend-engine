/**
 * Base class for all execution nodes
 */
class ExecutionNode {
  constructor() {
    this.resultType = null;
  }

  /**
   * Accept a visitor to process this node
   * @param {ExecutionNodeVisitor} visitor - The visitor to process this node
   * @returns {*} - The result of the visitor's processing
   */
  accept(visitor) {
    throw new Error('Method not implemented');
  }
}

module.exports = {
  ExecutionNode
};
