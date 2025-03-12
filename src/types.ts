/**
 * Common type definitions for the legend-engine TypeScript implementation
 */

/**
 * Represents an identity with authentication information
 */
export interface Identity {
  /**
   * Get the name of the identity
   * @returns The name of the identity
   */
  getName(): string;
}

/**
 * Represents a database connection configuration
 */
export interface DatabaseConnection {
  /**
   * The type of the database
   */
  type: {
    name: string;
  };
  /**
   * The time zone of the database
   */
  timeZone?: string;
}

/**
 * Represents a store execution state
 */
export interface StoreExecutionState {
  /**
   * Get the type of the store
   * @returns The type of the store
   */
  getStoreType(): string;
  
  /**
   * Get the relational executor
   * @returns The relational executor
   */
  getRelationalExecutor(): any;
  
  /**
   * Check if the connection should be retained
   * @returns Whether the connection should be retained
   */
  retainConnection(): boolean;
  
  /**
   * Get the runtime context
   * @returns The runtime context
   */
  getRuntimeContext(): any;
  
  /**
   * Get the block connection context
   * @returns The block connection context
   */
  getBlockConnectionContext(): any;
}

/**
 * Represents a request context
 */
export interface RequestContext {
  /**
   * The referral information
   */
  referral?: string;
}

/**
 * Represents a database connection
 */
export interface DatabaseConnectionInstance {
  /**
   * Execute a SQL query
   * @param sql The SQL query to execute
   * @returns The result of the query
   */
  query(sql: string): Promise<{ rows: any[], rowCount: number }>;
  
  /**
   * Close the connection
   */
  close(): Promise<void> | void;
  
  /**
   * Whether the connection is closed
   */
  isClosed: boolean;
}

/**
 * Represents a result column
 */
export interface ResultColumn {
  /**
   * The name of the column
   */
  name: string;
  
  /**
   * The type of the column
   */
  type?: string;
}
