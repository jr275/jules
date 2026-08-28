import { AppError } from './types';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'BANKING' | 'ERP' | 'GOOGLE' | 'MICROSOFT' | 'DATA' | 'REPORTING';
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiredPermission: string;
}

export class ToolRegistry {
  private static tools: Map<string, ToolDefinition> = new Map();

  static registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.id, tool);
  }

  static getTool(toolId: string): ToolDefinition {
    const tool = this.tools.get(toolId);
    if (!tool) {
      throw new AppError('NOT_FOUND', `Tool '${toolId}' is not registered in ToolRegistry`);
    }
    return tool;
  }

  static validateToolCallInput(toolId: string, input: Record<string, unknown>): boolean {
    const tool = this.getTool(toolId);
    if (!input || typeof input !== 'object') {
      throw new AppError('VALIDATION_ERROR', `Invalid input object passed to tool '${tool.name}'`);
    }
    return true;
  }
}

// Initial Registered Tools
ToolRegistry.registerTool({
  id: 'tool-bank-query',
  name: 'Bank Account Balance Query',
  description: 'Queries real-time balance across global cash accounts',
  category: 'BANKING',
  inputSchema: { entityId: 'string' },
  outputSchema: { totalCashUSD: 'number', balances: 'array' },
  riskLevel: 'LOW',
  requiredPermission: 'VIEW',
});

ToolRegistry.registerTool({
  id: 'tool-google-sheet-read',
  name: 'Google Sheets Data Reader',
  description: 'Reads rows, ranges, and formulas from connected Google Sheets',
  category: 'GOOGLE',
  inputSchema: { sheetId: 'string', range: 'string' },
  outputSchema: { rows: 'array' },
  riskLevel: 'LOW',
  requiredPermission: 'VIEW',
});
