const { ExecutionPlan, SingleExecutionPlan } = require('../src/protocol/ExecutionPlan');
const { SQLExecutionNode } = require('../src/protocol/SQLExecutionNode');
const { PlanExecutor } = require('../src/execution/PlanExecutor');
const { ConnectionManagerSelector } = require('../src/execution/connection/ConnectionManagerSelector');
const { Result } = require('../src/execution/Result');

// Mock RelationalStoreExecutionState
class MockRelationalStoreExecutionState {
  constructor() {
    this.relationalExecutor = {
      execute: jest.fn().mockImplementation((node, identity, executionState) => {
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

  getStoreType() {
    return 'Relational';
  }

  getRelationalExecutor() {
    return this.relationalExecutor;
  }

  retainConnection() {
    return false;
  }

  getRuntimeContext() {
    return {};
  }

  getBlockConnectionContext() {
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
class MockIdentity {
  constructor(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }
}

describe('PlanExecutor', () => {
  let planExecutor;
  let mockConnection;
  let mockConnectionManager;

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
});
