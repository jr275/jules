import { describe, it, expect } from 'vitest';
import { CredentialManager } from '../src/lib/domain/credentials';
import { ConnectorService } from '../src/lib/domain/connectors';

const hasGoogleAuth =
  !!process.env.GOOGLE_CLIENT_ID &&
  !!process.env.GOOGLE_CLIENT_SECRET &&
  !!process.env.GOOGLE_TEST_SPREADSHEET_ID;

describe('Phase 3B.1 Real Google Sheets API Smoke Test', () => {
  const tenantId = 'tenant-northstar-001';

  if (!hasGoogleAuth) {
    it('REAL GOOGLE SMOKE TEST STATUS: BLOCKED (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_TEST_SPREADSHEET_ID missing in environment)', () => {
      console.log('REAL GOOGLE SMOKE TEST STATUS: BLOCKED — credential or test spreadsheet not configured in environment.');
      expect(hasGoogleAuth).toBe(false);
    });
  } else {
    it('Real Google Sheets API Read Test', async () => {
      const keyRef = 'vault-google-sheets-real-001';
      const spreadsheetId = process.env.GOOGLE_TEST_SPREADSHEET_ID!;

      const sheetData = await ConnectorService.fetchGoogleSheetData(
        tenantId,
        keyRef,
        spreadsheetId,
        'A1:Z10'
      );

      expect(sheetData.rows).toBeDefined();
      expect(Array.isArray(sheetData.rows)).toBe(true);
      expect(sheetData.source).toContain(spreadsheetId);
    });
  }
});
