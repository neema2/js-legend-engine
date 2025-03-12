import { ExecutionPlan, SingleExecutionPlan } from '../src/protocol/ExecutionPlan';
import { SQLExecutionNode } from '../src/protocol/SQLExecutionNode';
import { PlanExecutor } from '../src/execution/PlanExecutor';
import { ConnectionManagerSelector } from '../src/execution/connection/ConnectionManagerSelector';
import { Result } from '../src/execution/Result';
import { Identity, StoreExecutionState } from '../src/types';

// Mock RelationalStoreExecutionState
class MockRelationalStoreExecutionState implements StoreExecutionState {
  // Changed to public for test access
  public relationalExecutor: any;

  constructor() {
    this.relationalExecutor = {
      execute: jest.fn().mockImplementation((node: any, identity: any, executionState: any) => {
        return {
          activities: executionState.activities,
          columnNames: ['id', 'name', 'value'],
          resultSet: {
            rows: [
              { id: 1, name: 'Test 1', value: 100 },
              { id: 2, name: 'Test 2', value: 200 }
            ]
          }
        };
      })
    };
  }

  getStoreType(): string {
    return 'Relational';
  }

  getRelationalExecutor(): any {
    return this.relationalExecutor;
  }

  retainConnection(): boolean {
    return false;
  }

  getRuntimeContext(): any {
    return {};
  }

  getBlockConnectionContext(): any {
    return {
      getBlockConnection: jest.fn().mockReturnValue({
        query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
        close: jest.fn(),
        isClosed: false
      })
    };
  }
}

// Mock Identity
class MockIdentity implements Identity {
  constructor(private readonly name: string) {}

  getName(): string {
    return this.name;
  }
}

describe('PlanExecutor', () => {
  let planExecutor: PlanExecutor;
  let mockConnection: any;
  let mockConnectionManager: any;

  beforeEach(() => {
    // Set up mock connection
    mockConnection = {
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      close: jest.fn(),
      isClosed: false
    };

    // Set up mock connection manager
    mockConnectionManager = {
      getDatabaseConnection: jest.fn().mockReturnValue(mockConnection)
    };

    // Set up plan executor with mock connection manager
    planExecutor = new PlanExecutor({
      extraExecutors: [{
        buildStoreExecutionState: () => new MockRelationalStoreExecutionState()
      }]
    });
  });

  test('should execute a SQL execution plan', async () => {
    // Create a SQL execution node
    const sqlQuery = 'SELECT * FROM test_table';
    const connection = {
      type: { name: 'H2' },
      timeZone: 'UTC'
    };
    const sqlExecutionNode = new SQLExecutionNode(sqlQuery, connection);

    // Create an execution plan with the SQL execution node
    const executionPlan = new SingleExecutionPlan(sqlExecutionNode);

    // Execute the plan
    const result = await planExecutor.execute(executionPlan, {}, 'testUser', new MockIdentity('testUser'));

    // Verify the result
    expect(result).toBeDefined();
    expect(result.activities).toBeDefined();
  });

  test('should handle SQL mutation operations', async () => {
    // Create a SQL execution node for an INSERT operation
    const sqlQuery = 'INSERT INTO test_table (name, value) VALUES (\'Test\', 100)';
    const connection = {
      type: { name: 'H2' },
      timeZone: 'UTC'
    };
    const sqlExecutionNode = new SQLExecutionNode(sqlQuery, connection, [], true);

    // Create an execution plan with the SQL execution node
    const executionPlan = new SingleExecutionPlan(sqlExecutionNode);

    // Execute the plan
    const result = await planExecutor.execute(executionPlan, {}, 'testUser', new MockIdentity('testUser'));

    // Verify the result
    expect(result).toBeDefined();
    expect(result.activities).toBeDefined();
  });

  test('should pass variables to SQL execution', async () => {
    // Create a SQL execution node with a variable
    const sqlQuery = 'SELECT * FROM test_table WHERE id = ${id}';
    const connection = {
      type: { name: 'H2' },
      timeZone: 'UTC'
    };
    const sqlExecutionNode = new SQLExecutionNode(sqlQuery, connection);

    // Create an execution plan with the SQL execution node
    const executionPlan = new SingleExecutionPlan(sqlExecutionNode);

    // Execute the plan with variables
    const result = await planExecutor.execute(executionPlan, { id: 1 }, 'testUser', new MockIdentity('testUser'));

    // Verify the result
    expect(result).toBeDefined();
    expect(result.activities).toBeDefined();
  });

  test('should handle database connection errors', async () => {
    // Create a SQL execution node
    const sqlQuery = 'SELECT * FROM test_table';
    const connection = {
      type: { name: 'H2' },
      timeZone: 'UTC'
    };
    const sqlExecutionNode = new SQLExecutionNode(sqlQuery, connection);

    // Create an execution plan with the SQL execution node
    const executionPlan = new SingleExecutionPlan(sqlExecutionNode);

    // Mock a connection error
    const mockError = new Error('Connection failed');
    const mockRelationalStoreExecutionState = new MockRelationalStoreExecutionState();
    mockRelationalStoreExecutionState.relationalExecutor.execute.mockRejectedValue(mockError);

    // Set up plan executor with mock connection manager that throws an error
    const errorPlanExecutor = new PlanExecutor({
      extraExecutors: [{
        buildStoreExecutionState: () => mockRelationalStoreExecutionState
      }]
    });

    // Execute the plan and expect it to throw an error
    await expect(errorPlanExecutor.execute(executionPlan, {}, 'testUser', new MockIdentity('testUser')))
      .rejects.toThrow('Connection failed');
  });

  test('should process SQL templates with variables', async () => {
    // Create a SQL execution node with a template
    const sqlQuery = 'SELECT * FROM test_table WHERE id = ${id}';
    const connection = {
      type: { name: 'H2' },
      timeZone: 'UTC'
    };
    const sqlExecutionNode = new SQLExecutionNode(sqlQuery, connection);

    // Create an execution plan with the SQL execution node
    const executionPlan = new SingleExecutionPlan(sqlExecutionNode);

    // Execute the plan with variables
    const result = await planExecutor.execute(executionPlan, { id: 1 }, 'testUser', new MockIdentity('testUser'));

    // Verify the result
    expect(result).toBeDefined();
    expect(result.activities).toBeDefined();
  });
});
