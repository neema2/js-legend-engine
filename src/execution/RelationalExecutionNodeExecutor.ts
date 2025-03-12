import { ExecutionNodeVisitor } from './ExecutionNodeVisitor';
import { ExecutionState } from './ExecutionState';
import { ExecutionNode } from '../protocol/ExecutionNode';
import { SQLExecutionNode } from '../protocol/SQLExecutionNode';
import { Identity } from '../types';
import { Result } from './Result';

/**
 * Executor for relational execution nodes
 */
export class RelationalExecutionNodeExecutor extends ExecutionNodeVisitor {
  /**
   * Create a new RelationalExecutionNodeExecutor
   * @param executionState - The execution state
   * @param identity - The identity of the executor
   */
  constructor(
    private readonly executionState: ExecutionState,
    private readonly identity: Identity | null
  ) {
    super();
  }

  /**
   * Visit an execution node
   * @param node - The node to visit
   * @returns The result of visiting the node
   */
  async visit(node: ExecutionNode): Promise<Result> {
    // Handle SQLExecutionNode
    if (node instanceof SQLExecutionNode) {
      return this.visitSQLExecutionNode(node);
    }
    
    throw new Error(`Unsupported node type: ${node.constructor.name}`);
  }

  /**
   * Visit a SQLExecutionNode
   * @param node - The SQLExecutionNode to visit
   * @returns The result of visiting the node
   */
  async visitSQLExecutionNode(node: SQLExecutionNode): Promise<Result> {
    const relationalExecutor = this.executionState.getStoreExecutionState('Relational')?.getRelationalExecutor();
    if (!relationalExecutor) {
      throw new Error('Relational executor not found');
    }
    return relationalExecutor.execute(node, this.identity, this.executionState);
  }
}
