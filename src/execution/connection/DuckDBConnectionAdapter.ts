import { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm/dist/types/src/parallel';
import { DatabaseConnectionInstance, ResultColumn } from '../../types';

/**
 * Adapter for DuckDB-wasm connections to match the expected interface
 */
export class DuckDBConnectionAdapter implements DatabaseConnectionInstance {
  public isClosed: boolean = false;

  /**
   * Create a new DuckDBConnectionAdapter
   * @param connection - The DuckDB-wasm connection
   */
  constructor(private readonly connection: AsyncDuckDBConnection) {}

  /**
   * Execute a SQL query
   * @param sql - The SQL query to execute
   * @returns The result of the query
   */
  async query(sql: string): Promise<{ rows: any[], rowCount: number }> {
    try {
      console.log(`Executing SQL with DuckDB: ${sql}`);
      
      // Execute the query using DuckDB-wasm
      const result = await this.connection.query(sql);
      
      // Convert Arrow table to rows
      const rows = result.toArray();
      
      return {
        rows,
        rowCount: rows.length
      };
    } catch (error) {
      console.error('Error executing SQL with DuckDB:', error);
      throw error; // Propagate the original error
    }
  }

  /**
   * Close the connection
   */
  async close(): Promise<void> {
    if (!this.isClosed) {
      await this.connection.close();
      this.isClosed = true;
    }
  }
}
