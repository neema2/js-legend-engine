const { Result } = require('./Result');

/**
 * Result of a SQL update
 */
class SQLUpdateResult extends Result {
  /**
   * Create a new SQLUpdateResult
   * @param {Array} activities - The activities that led to this result
   * @param {string} databaseType - The database type
   * @param {Object} connection - The database connection
   * @param {Object} databaseConnection - The database connection configuration
   * @param {Identity} identity - The identity of the executor
   * @param {Array} temporaryTables - The temporary tables
   * @param {Object} requestContext - The request context
   */
  constructor(
    activities,
    databaseType,
    connection,
    databaseConnection,
    identity,
    temporaryTables,
    requestContext
  ) {
    super();
    this.activities = activities;
    this.databaseType = databaseType;
    this.connection = connection;
    this.databaseConnection = databaseConnection;
    this.identity = identity;
    this.temporaryTables = temporaryTables;
    this.requestContext = requestContext;
    
    // In a real implementation, this would store the update count
    this.updateCount = 0;
  }

  /**
   * Get the update count
   * @returns {number} - The update count
   */
  getUpdateCount() {
    return this.updateCount;
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
  SQLUpdateResult
};
