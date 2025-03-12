import { SQLExecutionNode } from '../protocol/SQLExecutionNode';
import { ExecutionState } from './ExecutionState';
import { SQLExecutionResult } from './SQLExecutionResult';
import { SQLUpdateResult } from './SQLUpdateResult';
import { Identity, DatabaseConnectionInstance } from '../types';
import { ConnectionManagerSelector } from './connection/ConnectionManagerSelector';

/**
 * Executor for SQL operations
 */
export class RelationalExecutor {
  private connectionManagerSelector: ConnectionManagerSelector;

  /**
   * Create a new RelationalExecutor
   */
  constructor() {
    this.connectionManagerSelector = new ConnectionManagerSelector();
  }

  /**
   * Execute a SQL execution node
   * @param node - The SQL execution node to execute
   * @param identity - The identity of the executor
   * @param executionState - The execution state
   * @returns The result of the execution
   */
  async execute(
    node: SQLExecutionNode,
    identity: Identity | null,
    executionState: ExecutionState
  ): Promise<SQLExecutionResult | SQLUpdateResult> {
    const databaseType = node.getDatabaseTypeName();
    const databaseTimeZone = node.getDatabaseTimeZone();
    
    // Get a database connection
    const connection = await this.getConnection(node, identity, executionState);
    
    // Process the SQL query with variables from the execution state
    const processedSql = node.prepareForSQLExecution(executionState.getVariables());
    
    // Execute the SQL query
    const result = await connection.query(processedSql);
    
    if (node.isMutationSQL) {
      return new SQLUpdateResult(
        executionState.activities,
        databaseType,
        connection,
        node.connection,
        identity,
        [],
        executionState.getRequestContext()
      );
    } else {
      const sqlResult = new SQLExecutionResult(
        executionState.activities,
        node,
        databaseType,
        databaseTimeZone,
        connection,
        identity,
        [],
        executionState.topSpan,
        executionState.getRequestContext(),
        executionState.logSQLWithParamValues()
      );
      
      // Set the result properties
      sqlResult.setResultSet(result);
      sqlResult.setColumnNames(Object.keys(result.rows[0] || {}));
      sqlResult.setExecutedSql(processedSql);
      
      return sqlResult;
    }
  }

  /**
   * Get a database connection
   * @param node - The SQL execution node
   * @param identity - The identity of the executor
   * @param executionState - The execution state
   * @returns The database connection
   */
  private async getConnection(
    node: SQLExecutionNode,
    identity: Identity | null,
    executionState: ExecutionState
  ): Promise<DatabaseConnectionInstance> {
    return this.connectionManagerSelector.getDatabaseConnection(
      identity,
      node.connection,
      executionState.getRuntimeContext?.() || {}
    );
  }
}
