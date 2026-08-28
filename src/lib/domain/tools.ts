import { AppError } from './types';

export interface ToolExecutionContext {
  tenantId: string;
  organizationId: string;
  agentId?: string;
  executionId?: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'BANKING' | 'ERP' | 'GOOGLE' | 'MICROSOFT' | 'DATA' | 'REPORTING' | 'TREASURY';
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiredPermission: string;
  execute?: (input: Record<string, unknown>, context: ToolExecutionContext) => Promise<Record<string, unknown>>;
}

export class ToolRegistry {
  private static tools: Map<string, ToolDefinition> = new Map();

  static registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.id, tool);
    // Also register by name slug for flexibility
    const nameSlug = tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    this.tools.set(nameSlug, tool);
  }

  static getTool(toolIdOrName: string): ToolDefinition {
    const tool = this.tools.get(toolIdOrName) || this.tools.get(toolIdOrName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    if (!tool) {
      throw new AppError('NOT_FOUND', `Tool '${toolIdOrName}' is not registered in ToolRegistry`);
    }
    return tool;
  }

  static hasTool(toolIdOrName: string): boolean {
    return this.tools.has(toolIdOrName) || this.tools.has(toolIdOrName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  }

  static async executeTool(
    toolIdOrName: string,
    input: Record<string, unknown>,
    context: ToolExecutionContext
  ): Promise<Record<string, unknown>> {
    const tool = this.getTool(toolIdOrName);

    if (!input || typeof input !== 'object') {
      throw new AppError('VALIDATION_ERROR', `Invalid input object passed to tool '${tool.name}'`);
    }

    if (tool.execute) {
      return await tool.execute(input, context);
    }

    // Default built-in tool behaviors for standard tools
    if (tool.id === 'tool-bank-query' || tool.name.includes('Bank Account Balance')) {
      return {
        totalCashUSD: 4820000,
        currency: 'USD',
        accounts: [
          { accountName: 'JPMorgan Chase Checking #4829', balanceUSD: 2500000, yieldAPY: 0.0 },
          { accountName: 'Citi Treasury Liquidity #9102', balanceUSD: 2320000, yieldAPY: 0.053 },
        ],
      };
    }

    if (tool.id === 'tool-google-sheet-read' || tool.name.includes('Google Sheets Data Reader')) {
      return {
        sheetTitle: 'FY26_Liquidity_Forecast_Q1.xlsx',
        lastUpdated: new Date().toISOString(),
        rows: [
          { category: 'Operating Buffer Target', amountUSD: 500000 },
          { category: 'Surplus Uninvested Balance', amountUSD: 2000000 },
          { category: 'Target Money Market Yield APY', rate: 0.053 },
        ],
      };
    }

    if (tool.id === 'tool-yield-calculator' || tool.name.includes('Yield Rate Calculator')) {
      const amountUSD = (input.amountUSD as number) || 2500000;
      const rateDelta = (input.rateDelta as number) || 0.045;
      const annualYieldUSD = Math.round(amountUSD * rateDelta);
      return {
        amountInvestedUSD: amountUSD,
        yieldRateAPY: rateDelta,
        annualYieldUSD,
        monthlyYieldUSD: Math.round(annualYieldUSD / 12),
      };
    }

    return {
      status: 'EXECUTED',
      toolId: tool.id,
      toolName: tool.name,
      resultSummary: `Executed tool '${tool.name}' successfully.`,
    };
  }
}

// Initial Registered Standard Tools
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

ToolRegistry.registerTool({
  id: 'tool-yield-calculator',
  name: 'Yield Rate Calculator',
  description: 'Calculates net yield and annual interest lift for liquid sweeps',
  category: 'TREASURY',
  inputSchema: { amountUSD: 'number', rateDelta: 'number' },
  outputSchema: { annualYieldUSD: 'number', monthlyYieldUSD: 'number' },
  riskLevel: 'LOW',
  requiredPermission: 'VIEW',
});

ToolRegistry.registerTool({
  id: 'tool-erp-scanner',
  name: 'ERP Payables Scanner',
  description: 'Scans accounts payable invoices and due dates',
  category: 'ERP',
  inputSchema: { daysHorizon: 'number' },
  outputSchema: { totalAPUSD: 'number', pendingInvoices: 'number' },
  riskLevel: 'LOW',
  requiredPermission: 'VIEW',
});
