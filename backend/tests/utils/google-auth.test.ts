import { getGoogleAccessToken } from '../../src/utils/google-auth';

jest.mock('node:crypto', () => {
  const actual = jest.requireActual<typeof import('node:crypto')>('node:crypto');
  return {
    ...actual,
    createPrivateKey: jest.fn().mockReturnValue({}),
    createSign: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnThis(),
      sign: jest.fn().mockReturnValue(Buffer.from('mock-signature')),
    }),
  };
});

const mockFetch = jest.fn();
global.fetch = mockFetch;

const TEST_SCOPES = ['https://www.googleapis.com/auth/calendar'];

describe('getGoogleAccessToken', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('getGoogleAccessToken_ShouldReturnAccessToken_WhenTokenExchangeSucceeds', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'test-access-token' }),
    });

    const token = await getGoogleAccessToken('sa@project.iam.gserviceaccount.com', 'key', TEST_SCOPES);

    expect(token).toBe('test-access-token');
  });

  it('getGoogleAccessToken_ShouldCallTokenEndpoint_WithJwtBearerGrant', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'test-token' }),
    });

    await getGoogleAccessToken('sa@project.iam.gserviceaccount.com', 'key', TEST_SCOPES);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://oauth2.googleapis.com/token');
    expect(options.method).toBe('POST');
    expect((options.body as URLSearchParams).get('grant_type')).toBe(
      'urn:ietf:params:oauth:grant-type:jwt-bearer',
    );
  });

  it('getGoogleAccessToken_ShouldThrow_WhenTokenExchangeFails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Unauthorized',
    });

    await expect(
      getGoogleAccessToken('sa@project.iam.gserviceaccount.com', 'key', TEST_SCOPES),
    ).rejects.toThrow('Authentication service unavailable');
  });

  it('getGoogleAccessToken_ShouldIncludeScopes_WhenBuildingJwtClaim', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'test-token' }),
    });

    const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
    await getGoogleAccessToken('sa@project.iam.gserviceaccount.com', 'key', scopes);

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const assertion = (options.body as URLSearchParams).get('assertion') as string;

    // The claim set is the second segment of the JWT (header.claimSet.signature)
    const claimSetBase64 = assertion.split('.')[1];
    const claimSet = JSON.parse(Buffer.from(claimSetBase64, 'base64url').toString('utf8')) as {
      scope: string;
    };
    expect(claimSet.scope).toBe(scopes.join(' '));
  });
});
