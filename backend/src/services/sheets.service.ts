import type { ValidatedContactPayload } from '../types/contact.types';
import { SHEETS_RANGE, SHEETS_SCOPES } from '../constants/contact.constants';
import { getGoogleAccessToken } from '../utils/google-auth';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export function createSheetsService(
  serviceAccountEmail: string,
  privateKey: string,
  sheetId: string,
) {
  const normalizedKey = privateKey.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();

  async function appendContactSubmission(payload: ValidatedContactPayload): Promise<void> {
    const accessToken = await getGoogleAccessToken(serviceAccountEmail, normalizedKey, [...SHEETS_SCOPES]);

    const row = [
      new Date().toISOString(),
      payload.name,
      payload.email,
      payload.phone,
      payload.service,
      payload.message,
    ];

    // RAW prevents Google Sheets from interpreting cell values as formulas,
    // guarding against formula/CSV injection (e.g. =IMPORTDATA(...) in user input).
    const url = `${SHEETS_API_BASE}/${sheetId}/values/${encodeURIComponent(SHEETS_RANGE)}:append?valueInputOption=RAW`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API error:', errorText);
      throw new Error('Failed to save contact submission');
    }
  }

  return { appendContactSubmission };
}

export type SheetsService = ReturnType<typeof createSheetsService>;
