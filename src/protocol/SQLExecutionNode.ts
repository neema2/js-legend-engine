import { ExecutionNode } from './ExecutionNode';
import { ExecutionNodeVisitor } from '../execution/ExecutionNodeVisitor';
import { DatabaseConnection } from '../types';

/**
 * Represents a SQL execution node in the execution plan
 */
export class SQLExecutionNode extends ExecutionNode {
  private _sqlComment: string | null = null;
  private onConnectionCloseCommitQuery: string | null = null;
  private onConnectionCloseRollbackQuery: string | null = null;
  private isResultColumnsDynamic: boolean = false;

  /**
   * Create a new SQLExecutionNode
   * @param _sqlQuery - The SQL query to execute
   * @param connection - The database connection configuration
   * @param resultColumns - The columns in the result
   * @param isMutationSQL - Whether this is a mutation SQL (INSERT, UPDATE, DELETE)
   */
  constructor(
    private readonly _sqlQuery: string,
    public readonly connection: DatabaseConnection,
    public readonly resultColumns: any[] = [],
    public readonly isMutationSQL: boolean = false
  ) {
    super();
  }

  /**
   * Accept a visitor to process this node
   * @param visitor - The visitor to process this node
   * @returns The result of the visitor's processing
   */
  accept(visitor: ExecutionNodeVisitor): Promise<any> {
    return visitor.visit(this);
  }

  /**
   * Get the SQL comment
   * @returns The SQL comment
   */
  sqlComment(): string | null {
    return this._sqlComment;
  }

  /**
   * Get the SQL query
   * @returns The SQL query
   */
  sqlQuery(): string {
    return this._sqlQuery;
  }

  /**
   * Get the database type name
   * @returns The database type name
   */
  getDatabaseTypeName(): string {
    return this.connection.type.name;
  }

  /**
   * Get the database time zone
   * @returns The database time zone
   */
  getDatabaseTimeZone(): string {
    return this.connection.timeZone || 'GMT';
  }

  /**
   * Get the SQL result columns
   * @returns The SQL result columns
   */
  getSQLResultColumns(): any[] {
    return [...this.resultColumns];
  }

  /**
   * Check if this is a void result
   * @returns Whether this is a void result
   */
  isResultVoid(): boolean {
    return this.resultType === 'void';
  }
}
