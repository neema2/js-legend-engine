import { Result } from './Result';
import { Identity, RequestContext, DatabaseConnection, DatabaseConnectionInstance } from '../types';

/**
 * Result of a SQL update operation
 */
export class SQLUpdateResult extends Result {
  private updateCount: number = 0;

  /**
   * Create a new SQLUpdateResult
   * @param activities - The activities that led to this result
   * @param databaseType - The database type
   * @param connection - The database connection
   * @param databaseConnection - The database connection configuration
   * @param identity - The identity of the executor
   * @param temporaryTables - The temporary tables
   * @param requestContext - The request context
   */
  constructor(
    activities: any[],
    private readonly databaseType: string,
    private readonly connection: DatabaseConnectionInstance,
    private readonly databaseConnection: DatabaseConnection,
    private readonly identity: Identity | null,
    private readonly temporaryTables: any[],
    private readonly requestContext: RequestContext | null
  ) {
    super();
    this.activities = activities;
  }

  /**
   * Get the update count
   * @returns The update count
   */
  getUpdateCount(): number {
    return this.updateCount;
  }

  /**
   * Set the update count
   * @param count - The update count
   */
  setUpdateCount(count: number): void {
    this.updateCount = count;
  }

  /**
   * Get the database type
   * @returns The database type
   */
  getDatabaseType(): string {
    return this.databaseType;
  }

  /**
   * Close the result and release any resources
   */
  override async close(): Promise<void> {
    if (this.connection && !this.connection.isClosed) {
      await this.connection.close();
    }
  }
}
