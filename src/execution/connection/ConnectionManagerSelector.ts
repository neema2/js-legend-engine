import { Identity, DatabaseConnection, DatabaseConnectionInstance } from '../../types';
import { DuckDBService } from './DuckDBService';
import { DuckDBConnectionAdapter } from './DuckDBConnectionAdapter';

/**
 * Selects and manages database connections
 */
export class ConnectionManagerSelector {
  private connectionManagers: Map<string, any> = new Map();
  private duckDBService: DuckDBService;

  /**
   * Create a new ConnectionManagerSelector
   * @param config - The configuration for the connection manager
   */
  constructor(private readonly config: {
    temporaryTestDb?: any;
    oauthProfiles?: Record<string, any>;
    flowProviderHolder?: any;
  } = {}) {
    this.duckDBService = DuckDBService.getInstance();
  }

  /**
   * Get a database connection
   * @param identity - The identity of the executor
   * @param databaseConnection - The database connection configuration
   * @param runtimeContext - The runtime context
   * @returns The database connection
   */
  async getDatabaseConnection(
    identity: Identity | null,
    databaseConnection: DatabaseConnection,
    runtimeContext: any
  ): Promise<DatabaseConnectionInstance> {
    const dbType = databaseConnection.type.name;
    
    try {
      // Initialize DuckDB if not already initialized
      await this.duckDBService.initialize();
      
      // Create a DuckDB connection
      const duckDBConnection = await this.duckDBService.createConnection();
      
      // Create and return a connection adapter
      return new DuckDBConnectionAdapter(duckDBConnection);
    } catch (error) {
      console.error(`Error creating ${dbType} connection:`, error);
      throw new Error(`Error creating ${dbType} connection: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
