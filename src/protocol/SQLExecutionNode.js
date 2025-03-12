const { ExecutionNode } = require('./ExecutionNode');

/**
 * Represents a SQL execution node in the execution plan
 */
class SQLExecutionNode extends ExecutionNode {
  /**
   * Create a new SQLExecutionNode
   * @param {string} sqlQuery - The SQL query to execute
   * @param {Object} connection - The database connection configuration
   * @param {Array} resultColumns - The columns in the result
   * @param {boolean} isMutationSQL - Whether this is a mutation SQL (INSERT, UPDATE, DELETE)
   */
  constructor(sqlQuery, connection, resultColumns = [], isMutationSQL = false) {
    super();
    this.sqlQuery = sqlQuery;
    this.sqlComment = null;
    this.onConnectionCloseCommitQuery = null;
    this.onConnectionCloseRollbackQuery = null;
    this.connection = connection;
    this.resultColumns = resultColumns;
    this.isResultColumnsDynamic = false;
    this.isMutationSQL = isMutationSQL;
  }

  /**
   * Accept a visitor to process this node
   * @param {ExecutionNodeVisitor} visitor - The visitor to process this node
   * @returns {*} - The result of the visitor's processing
   */
  accept(visitor) {
    return visitor.visit(this);
  }

  /**
   * Get the SQL comment
   * @returns {string} - The SQL comment
   */
  sqlComment() {
    return this.sqlComment;
  }

  /**
   * Get the SQL query
   * @returns {string} - The SQL query
   */
  sqlQuery() {
    return this.sqlQuery;
  }

  /**
   * Get the database type name
   * @returns {string} - The database type name
   */
  getDatabaseTypeName() {
    return this.connection.type.name;
  }

  /**
   * Get the database time zone
   * @returns {string} - The database time zone
   */
  getDatabaseTimeZone() {
    return this.connection.timeZone || 'GMT';
  }

  /**
   * Get the SQL result columns
   * @returns {Array} - The SQL result columns
   */
  getSQLResultColumns() {
    return [...this.resultColumns];
  }

  /**
   * Check if this is a void result
   * @returns {boolean} - Whether this is a void result
   */
  isResultVoid() {
    return this.resultType === 'void';
  }
}

module.exports = {
  SQLExecutionNode
};
