/**
 * Interface for visitors that process execution nodes
 */
class ExecutionNodeVisitor {
  /**
   * Visit an execution node
   * @param {ExecutionNode} node - The node to visit
   * @returns {*} - The result of visiting the node
   */
  visit(node) {
    throw new Error('Method not implemented');
  }
}

module.exports = {
  ExecutionNodeVisitor
};
