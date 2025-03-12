import { ExecutionNode } from '../protocol/ExecutionNode';
import { SQLExecutionNode } from '../protocol/SQLExecutionNode';

/**
 * Interface for visitors that process execution nodes
 */
export abstract class ExecutionNodeVisitor {
  /**
   * Visit an execution node
   * @param node - The node to visit
   * @returns The result of visiting the node
   */
  abstract visit(node: ExecutionNode): Promise<any>;
  
  /**
   * Visit a SQLExecutionNode
   * @param node - The SQLExecutionNode to visit
   * @returns The result of visiting the node
   */
  abstract visitSQLExecutionNode(node: SQLExecutionNode): Promise<any>;
}
