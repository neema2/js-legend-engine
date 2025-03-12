import { ExecutionNodeVisitor } from '../execution/ExecutionNodeVisitor';

/**
 * Base class for all execution nodes
 */
export abstract class ExecutionNode {
  protected resultType: string | null = null;

  /**
   * Accept a visitor to process this node
   * @param visitor - The visitor to process this node
   * @returns The result of the visitor's processing
   */
  abstract accept(visitor: ExecutionNodeVisitor): Promise<any>;
}
