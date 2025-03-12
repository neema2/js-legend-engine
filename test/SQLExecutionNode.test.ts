import { SQLExecutionNode } from '../src/protocol/SQLExecutionNode';
import { DatabaseConnection } from '../src/types';

describe('SQLExecutionNode', () => {
  test('should process SQL templates with variables', () => {
    // Create a SQL execution node with a template
    const sqlQuery = 'SELECT * FROM test_table WHERE id = ${id}';
    const connection: DatabaseConnection = {
      type: { name: 'H2' },
      timeZone: 'UTC'
    };
    const sqlExecutionNode = new SQLExecutionNode(sqlQuery, connection);

    // Process the template with variables
    const processedSql = sqlExecutionNode.prepareForSQLExecution({ id: 1 });

    // Verify the processed SQL
    expect(processedSql).toBe('SELECT * FROM test_table WHERE id = 1');
  });

  test('should handle complex SQL templates', () => {
    // Create a SQL execution node with a complex template
    const sqlQuery = `
      SELECT *
      FROM test_table
      WHERE id = \${id}
      <#if name??>
        AND name = '\${name}'
      </#if>
      <#if value gt 0>
        AND value > \${value}
      </#if>
    `;
    const connection: DatabaseConnection = {
      type: { name: 'H2' },
      timeZone: 'UTC'
    };
    const sqlExecutionNode = new SQLExecutionNode(sqlQuery, connection);

    // Process the template with variables
    const processedSql = sqlExecutionNode.prepareForSQLExecution({
      id: 1,
      name: 'Test',
      value: 100
    });

    // Verify the processed SQL
    expect(processedSql).toContain('WHERE id = 1');
    expect(processedSql).toContain("AND name = 'Test'");
    expect(processedSql).toContain('AND value > 100');
  });

  test('should handle missing variables', () => {
    // Create a SQL execution node with a template
    const sqlQuery = 'SELECT * FROM test_table WHERE id = ${id}';
    const connection: DatabaseConnection = {
      type: { name: 'H2' },
      timeZone: 'UTC'
    };
    const sqlExecutionNode = new SQLExecutionNode(sqlQuery, connection);

    // Process the template with missing variables
    expect(() => sqlExecutionNode.prepareForSQLExecution({})).toThrow();
  });
});
