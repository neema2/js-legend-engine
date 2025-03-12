const { SQLExecutionResult } = require('./SQLExecutionResult');
const { SQLUpdateResult } = require('./SQLUpdateResult');

/**
 * Executor for relational operations
 */
class RelationalExecutor {
  /**
   * Create a new RelationalExecutor
   * @param {Object} config - The configuration for the executor
   */
  constructor(config = {}) {
    this.connectionManager = config.connectionManager;
    this.config = config;
  }

  /**
   * Execute a SQLExecutionNode
   * @param {SQLExecutionNode} node - The SQLExecutionNode to execute
   * @param {Identity} identity - The identity of the executor
   * @param {ExecutionState} executionState - The execution state
   * @returns {Result} - The result of the execution
   */
  async execute(node, identity, executionState) {
    const databaseTimeZone = node.getDatabaseTimeZone();
    const databaseType = node.getDatabaseTypeName();
    const tempTableList = [];

    // Get a connection from the connection manager
    const connection = await this.getConnection(node, identity, executionState.getStoreExecutionState('Relational'));

    try {
      // Prepare the SQL query (replace variables, etc.)
      const processedSql = await this.prepareForSQLExecution(
        node.sqlQuery(),
        node.sqlComment(),
        connection,
        databaseTimeZone,
        databaseType,
        tempTableList,
        identity,
        executionState,
        true
      );

      // Log the SQL query
      if (executionState.logSQLWithParamValues()) {
        console.log(`Executing SQL: ${processedSql}`);
      }

      // Add the execution activity
      executionState.activities.push({
        type: 'RelationalExecution',
        sql: processedSql,
        comment: node.sqlComment()
      });

      // Check if this is a mutation SQL
      if (node.isMutationSQL) {
        // Execute the SQL update
        const result = await connection.query(processedSql);
        return new SQLUpdateResult(
          executionState.activities,
          databaseType,
          connection,
          node.connection,
          identity,
          tempTableList,
          executionState.getRequestContext()
        );
      }

      // Execute the SQL query
      const result = await connection.query(processedSql);

      // Return the result
      return new SQLExecutionResult(
        executionState.activities,
        node,
        databaseType,
        databaseTimeZone,
        connection,
        identity,
        tempTableList,
        executionState.topSpan,
        executionState.getRequestContext(),
        executionState.logSQLWithParamValues()
      );
    } catch (error) {
      // Close the connection on error
      if (connection && !executionState.getStoreExecutionState('Relational').retainConnection()) {
        await connection.close();
      }
      throw error;
    }
  }

  /**
   * Prepare a SQL query for execution
   * @param {string} sqlQuery - The SQL query
   * @param {string} sqlComment - The SQL comment
   * @param {Object} connection - The database connection
   * @param {string} databaseTimeZone - The database time zone
   * @param {string} databaseType - The database type
   * @param {Array} tempTableList - The list of temporary tables
   * @param {Identity} identity - The identity of the executor
   * @param {ExecutionState} executionState - The execution state
   * @param {boolean} shouldLogSQL - Whether to log the SQL
   * @returns {string} - The prepared SQL query
   */
  async prepareForSQLExecution(
    sqlQuery,
    sqlComment,
    connection,
    databaseTimeZone,
    databaseType,
    tempTableList,
    identity,
    executionState,
    shouldLogSQL
  ) {
    // In a real implementation, this would replace variables, handle temp tables, etc.
    // For simplicity, we'll just return the SQL query
    return sqlQuery;
  }

  /**
   * Get a connection from the connection manager
   * @param {SQLExecutionNode} node - The SQLExecutionNode
   * @param {Identity} identity - The identity of the executor
   * @param {RelationalStoreExecutionState} executionState - The relational store execution state
   * @returns {Object} - The database connection
   */
  async getConnection(node, identity, executionState) {
    if (executionState.retainConnection()) {
      // Get a connection from the block connection context
      return executionState.getBlockConnectionContext().getBlockConnection(
        executionState,
        node.connection,
        identity
      );
    }
    
    // Get a connection from the connection manager
    return this.connectionManager.getDatabaseConnection(
      identity,
      node.connection,
      executionState.getRuntimeContext()
    );
  }
}

module.exports = {
  RelationalExecutor
};
