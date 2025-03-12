import { DuckDBService } from '../src/execution/connection/DuckDBService';
import { DuckDBConnectionAdapter } from '../src/execution/connection/DuckDBConnectionAdapter';
import { PlanExecutor } from '../src/execution/PlanExecutor';
import { SQLExecutionNode } from '../src/protocol/SQLExecutionNode';
import { SingleExecutionPlan } from '../src/protocol/ExecutionPlan';

describe('DuckDB Integration', () => {
  let duckDBService: DuckDBService;

  beforeAll(async () => {
    duckDBService = DuckDBService.getInstance();
    await duckDBService.initialize();
  });

  afterAll(async () => {
    await duckDBService.terminate();
  });

  test('should execute a simple SQL query', async () => {
    const connection = await duckDBService.createConnection();
    const adapter = new DuckDBConnectionAdapter(connection);

    const result = await adapter.query('SELECT 42 AS answer');
    
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].answer).toBe(42);
    expect(result.rowCount).toBe(1);

    await adapter.close();
    expect(adapter.isClosed).toBe(true);
  });

  test('should handle multiple queries', async () => {
    const connection = await duckDBService.createConnection();
    const adapter = new DuckDBConnectionAdapter(connection);

    // Create a table
    await adapter.query('CREATE TABLE test (id INTEGER, name VARCHAR)');
    
    // Insert data
    await adapter.query("INSERT INTO test VALUES (1, 'Test 1'), (2, 'Test 2')");
    
    // Query data
    const result = await adapter.query('SELECT * FROM test ORDER BY id');
    
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].id).toBe(1);
    expect(result.rows[0].name).toBe('Test 1');
    expect(result.rows[1].id).toBe(2);
    expect(result.rows[1].name).toBe('Test 2');

    await adapter.close();
  });

  test('should handle errors', async () => {
    const connection = await duckDBService.createConnection();
    const adapter = new DuckDBConnectionAdapter(connection);

    await expect(adapter.query('SELECT * FROM non_existent_table')).rejects.toThrow();

    await adapter.close();
  });

  test('should execute SQL with variables', async () => {
    const connection = await duckDBService.createConnection();
    const adapter = new DuckDBConnectionAdapter(connection);

    // Create a table
    await adapter.query('CREATE TABLE test_vars (id INTEGER, name VARCHAR)');
    
    // Insert data
    await adapter.query("INSERT INTO test_vars VALUES (1, 'Test 1'), (2, 'Test 2')");
    
    // Create a SQL execution node with a variable
    const sqlQuery = 'SELECT * FROM test_vars WHERE id = ${id}';
    const sqlExecutionNode = new SQLExecutionNode(sqlQuery, {
      type: { name: 'DuckDB' },
      timeZone: 'UTC'
    });
    
    // Process the SQL with variables
    const processedSql = sqlExecutionNode.prepareForSQLExecution({ id: 1 });
    
    // Execute the processed SQL
    const result = await adapter.query(processedSql);
    
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].id).toBe(1);
    expect(result.rows[0].name).toBe('Test 1');

    await adapter.close();
  });

  test('should execute SQL through PlanExecutor', async () => {
    // Create a SQL execution node
    const sqlQuery = 'SELECT 42 AS answer';
    const sqlExecutionNode = new SQLExecutionNode(sqlQuery, {
      type: { name: 'DuckDB' },
      timeZone: 'UTC'
    });
    
    // Create an execution plan
    const executionPlan = new SingleExecutionPlan(sqlExecutionNode);
    
    // Create a plan executor
    const planExecutor = new PlanExecutor({
      extraExecutors: [{
        buildStoreExecutionState: () => ({
          getStoreType: () => 'Relational',
          getRelationalExecutor: () => ({
            execute: async (node: any, identity: any, executionState: any) => {
              const connection = await duckDBService.createConnection();
              const adapter = new DuckDBConnectionAdapter(connection);
              const result = await adapter.query(sqlQuery);
              await adapter.close();
              return result;
            }
          }),
          retainConnection: () => false,
          getRuntimeContext: () => ({}),
          getBlockConnectionContext: () => ({})
        })
      }]
    });
    
    // Execute the plan
    const result = await planExecutor.execute(executionPlan);
    
    // Verify the result
    expect(result).toBeDefined();
  });
});
