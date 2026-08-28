import { AppError } from './types';

export type ConnectorCategory = 'GOOGLE' | 'MICROSOFT' | 'FINANCE' | 'BUSINESS' | 'DATA';

export interface ConnectorDefinition {
  type: string;
  category: ConnectorCategory;
  name: string;
  description: string;
  authMethod: 'OAUTH2' | 'API_KEY' | 'MTLS' | 'DATABASE_URL';
  requiredScopes: string[];
}

export const SUPPORTED_CONNECTORS: ConnectorDefinition[] = [
  {
    type: 'GOOGLE_SHEETS',
    category: 'GOOGLE',
    name: 'Google Sheets',
    description: 'Read and write financial model spreadsheets and forecasts',
    authMethod: 'OAUTH2',
    requiredScopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  },
  {
    type: 'GOOGLE_DRIVE',
    category: 'GOOGLE',
    name: 'Google Drive',
    description: 'Access financial report folders and PDFs',
    authMethod: 'OAUTH2',
    requiredScopes: ['https://www.googleapis.com/auth/drive.readonly'],
  },
  {
    type: 'GOOGLE_DOCS',
    category: 'GOOGLE',
    name: 'Google Docs',
    description: 'Generate CFO executive commentary and board memos',
    authMethod: 'OAUTH2',
    requiredScopes: ['https://www.googleapis.com/auth/documents'],
  },
  {
    type: 'GMAIL',
    category: 'GOOGLE',
    name: 'Gmail',
    description: 'Send automated executive summaries and payment notifications',
    authMethod: 'OAUTH2',
    requiredScopes: ['https://www.googleapis.com/auth/gmail.send'],
  },
  {
    type: 'BANK_API',
    category: 'FINANCE',
    name: 'Global Banking Open API',
    description: 'Query real-time bank balances and SWIFT cash transactions',
    authMethod: 'MTLS',
    requiredScopes: ['accounts.read', 'balances.read'],
  },
  {
    type: 'SAP_ERP',
    category: 'FINANCE',
    name: 'SAP S/4HANA ERP',
    description: 'Read payables, receivables, and ledger actuals',
    authMethod: 'API_KEY',
    requiredScopes: ['ledger.read', 'invoices.read'],
  },
];

export class ConnectorService {
  /**
   * Safe status check guaranteeing zero plaintext secret exposure to client.
   */
  static getStatusDisplay(status: string): { text: string; color: string } {
    switch (status) {
      case 'CONNECTED':
        return { text: 'CONNECTED', color: 'bg-emerald-500' };
      case 'EXPIRED':
        return { text: 'REAUTHORIZATION REQUIRED', color: 'bg-amber-500' };
      case 'ERROR':
        return { text: 'CONNECTION ERROR', color: 'bg-rose-500' };
      default:
        return { text: 'NOT CONFIGURED', color: 'bg-slate-500' };
    }
  }
}
