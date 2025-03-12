const { Result } = require('./Result');

/**
 * Result of a SQL execution
 */
class SQLExecutionResult extends Result {
  /**
   * Create a new SQLExecutionResult
   * @param {Array} activities - The activities that led to this result
   * @param {SQLExecutionNode} sqlExecutionNode - The SQL execution node
   * @param {string} databaseType - The database type
   * @param {string} databaseTimeZone - The database time zone
   * @param {Object} connection - The database connection
   * @param {Identity} identity - The identity of the executor
   * @param {Array} temporaryTables - The temporary tables
   * @param {Object} topSpan - The top span
   * @param {Object} requestContext - The request context
   * @param {boolean} logSQLWithParamValues - Whether to log SQL with parameter values
   */
  constructor(
    activities,
    sqlExecutionNode,
    databaseType,
    databaseTimeZone,
    connection,
    identity,
    temporaryTables,
    topSpan,
    requestContext,
    logSQLWithParamValues = true
  ) {
    super();
    this.activities = activities;
    this.sqlExecutionNode = sqlExecutionNode;
    this.databaseType = databaseType;
    this.databaseTimeZone = databaseTimeZone;
    this.connection = connection;
    this.identity = identity;
    this.temporaryTables = temporaryTables;
    this.topSpan = topSpan;
    this.requestContext = requestContext;
    this.logSQLWithParamValues = logSQLWithParamValues;
    
    // In a real implementation, this would execute the SQL query and store the result
    this.resultSet = null;
    this.columnCount = 0;
    this.columnNames = [];
    this.resultColumns = [];
    this.executedSql = '';
  }

  /**
   * Get the SQL execution node
   * @returns {SQLExecutionNode} - The SQL execution node
   */
  getSQLExecutionNode() {
    return this.sqlExecutionNode;
  }

  /**
   * Get the database type
   * @returns {string} - The database type
   */
  getDatabaseType() {
    return this.databaseType;
  }

  /**
   * Get the database time zone
   * @returns {string} - The database time zone
   */
  getDatabaseTimeZone() {
    return this.databaseTimeZone;
  }

  /**
   * Get the result set
   * @returns {Object} - The result set
   */
  getResultSet() {
    return this.resultSet;
  }

  /**
   * Get the column count
   * @returns {number} - The column count
   */
  getColumnCount() {
    return this.columnCount;
  }

  /**
   * Get the column names
   * @returns {Array} - The column names
   */
  getColumnNames() {
    return this.columnNames;
  }

  /**
   * Get the result columns
   * @returns {Array} - The result columns
   */
  getResultColumns() {
    return this.resultColumns;
  }

  /**
   * Get the executed SQL
   * @returns {string} - The executed SQL
   */
  getExecutedSql() {
    return this.executedSql;
  }

  /**
   * Close the result and release any resources
   */
  close() {
    if (this.connection && !this.connection.isClosed) {
      this.connection.close();
    }
  }
}

module.exports = {
  SQLExecutionResult
};
