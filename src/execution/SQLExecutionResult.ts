import { Result } from './Result';
import { SQLExecutionNode } from '../protocol/SQLExecutionNode';
import { Identity, RequestContext, DatabaseConnectionInstance } from '../types';

/**
 * Result of a SQL execution
 */
export class SQLExecutionResult extends Result {
  private resultSet: any = null;
  private columnCount: number = 0;
  private columnNames: string[] = [];
  private resultColumns: any[] = [];
  private executedSql: string = '';

  /**
   * Create a new SQLExecutionResult
   * @param activities - The activities that led to this result
   * @param sqlExecutionNode - The SQL execution node
   * @param databaseType - The database type
   * @param databaseTimeZone - The database time zone
   * @param connection - The database connection
   * @param identity - The identity of the executor
   * @param temporaryTables - The temporary tables
   * @param topSpan - The top span
   * @param requestContext - The request context
   * @param logSQLWithParamValues - Whether to log SQL with parameter values
   */
  constructor(
    activities: any[],
    private readonly sqlExecutionNode: SQLExecutionNode,
    private readonly databaseType: string,
    private readonly databaseTimeZone: string,
    private readonly connection: DatabaseConnectionInstance,
    private readonly identity: Identity | null,
    private readonly temporaryTables: any[],
    private readonly topSpan: any,
    private readonly requestContext: RequestContext | null,
    private readonly logSQLWithParamValues: boolean = true
  ) {
    super();
    this.activities = activities;
  }

  /**
   * Set the result set
   * @param resultSet - The result set
   */
  setResultSet(resultSet: any): void {
    this.resultSet = resultSet;
    this.columnCount = this.columnNames.length;
  }

  /**
   * Set the column names
   * @param columnNames - The column names
   */
  setColumnNames(columnNames: string[]): void {
    this.columnNames = columnNames;
    this.columnCount = columnNames.length;
  }

  /**
   * Set the executed SQL
   * @param executedSql - The executed SQL
   */
  setExecutedSql(executedSql: string): void {
    this.executedSql = executedSql;
  }

  /**
   * Get the SQL execution node
   * @returns The SQL execution node
   */
  getSQLExecutionNode(): SQLExecutionNode {
    return this.sqlExecutionNode;
  }

  /**
   * Get the database type
   * @returns The database type
   */
  getDatabaseType(): string {
    return this.databaseType;
  }

  /**
   * Get the database time zone
   * @returns The database time zone
   */
  getDatabaseTimeZone(): string {
    return this.databaseTimeZone;
  }

  /**
   * Get the result set
   * @returns The result set
   */
  getResultSet(): any {
    return this.resultSet;
  }

  /**
   * Get the column count
   * @returns The column count
   */
  getColumnCount(): number {
    return this.columnCount;
  }

  /**
   * Get the column names
   * @returns The column names
   */
  getColumnNames(): string[] {
    return this.columnNames;
  }

  /**
   * Get the result columns
   * @returns The result columns
   */
  getResultColumns(): any[] {
    return this.resultColumns;
  }

  /**
   * Get the executed SQL
   * @returns The executed SQL
   */
  getExecutedSql(): string {
    return this.executedSql;
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
