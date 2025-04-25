import { Parser } from 'freemarker-parser';

/**
 * Interface for SQL template processors
 */
export interface SQLTemplateProcessor {
  /**
   * Process a SQL template with variables
   * @param template - The SQL template to process
   * @param variables - The variables to substitute in the template
   * @returns The processed SQL query
   */
  process(template: string, variables: Record<string, any>): string;
}

// Define the types for freemarker-parser
interface ParserResult {
  ast: {
    body?: any[];
    type: string;
    start: number;
    end: number;
  };
  tokens: Array<{
    type: string;
    start: number;
    end: number;
    text?: string;
  }>;
}

/**
 * FreeMarker-based SQL template processor
 */
export class FreemarkerSQLTemplateProcessor implements SQLTemplateProcessor {
  private parser: Parser;

  /**
   * Create a new FreemarkerSQLTemplateProcessor
   */
  constructor() {
    this.parser = new Parser();
  }

  /**
   * Process a SQL template with variables using FreeMarker
   * @param template - The SQL template to process
   * @param variables - The variables to substitute in the template
   * @returns The processed SQL query
   */
  process(template: string, variables: Record<string, any>): string {
    try {
      // Simple variable substitution for now
      let processedTemplate = template;
      
      // Find all variable references in the template
      const variableReferences = template.match(/\$\{([^}]+)\}/g) || [];
      const requiredVariables = variableReferences.map(ref => ref.substring(2, ref.length - 1));
      
      // Check if all required variables are provided
      for (const variable of requiredVariables) {
        if (!(variable in variables)) {
          throw new Error(`Missing required variable: ${variable}`);
        }
      }
      
      // Replace ${variable} with actual values
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
        processedTemplate = processedTemplate.replace(regex, String(value));
      }
      
      return processedTemplate;
    } catch (error: any) {
      throw new Error(`Error processing SQL template: ${error.message || 'Unknown error'}`);
    }
  }
}
