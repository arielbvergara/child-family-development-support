import { createPrivateKey, createSign } from 'node:crypto';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

/**
 * Obtains a short-lived Google OAuth 2.0 access token for a service account
 * using the JWT bearer flow (RFC 7523). The token is valid for one hour.
 *
 * @param serviceAccountEmail - The `client_email` from the service account JSON key file.
 * @param privateKeyPem       - The `private_key` PEM string from the service account JSON key file.
 * @param scopes              - OAuth 2.0 scopes the token should grant access to.
 */
export async function getGoogleAccessToken(
  serviceAccountEmail: string,
  privateKeyPem: string,
  scopes: string[],
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claimSet = Buffer.from(
    JSON.stringify({
      iss: serviceAccountEmail,
      scope: scopes.join(' '),
      aud: GOOGLE_TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  ).toString('base64url');

  const signingInput = `${header}.${claimSet}`;
  const keyObject = createPrivateKey({ key: privateKeyPem, format: 'pem' });
  const signature = createSign('RSA-SHA256').update(signingInput).sign(keyObject).toString('base64url');
  const assertion = `${signingInput}.${signature}`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google OAuth token exchange failed:', errorText);
    throw new Error('Authentication service unavailable');
  }

  const json = (await response.json()) as { access_token: string };
  return json.access_token;
}
