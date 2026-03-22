// auth.js — PKCE Authorization Code flow for CLI login

import { createHash, randomBytes } from 'crypto';
import { createServer } from 'http';
import open from 'open';
import {
  COGNITO_DOMAIN,
  CLI_CLIENT_ID,
  CALLBACK_PORT,
  CALLBACK_URL,
  getCredentials,
  saveCredentials,
} from './config.js';

function base64url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateCodeVerifier() {
  return base64url(randomBytes(32));
}

function generateCodeChallenge(verifier) {
  return base64url(createHash('sha256').update(verifier).digest());
}

/**
 * Run the PKCE login flow:
 * 1. Start localhost server
 * 2. Open browser to Cognito authorize endpoint
 * 3. Capture auth code from redirect
 * 4. Exchange for tokens
 * 5. Save credentials
 */
export async function performLogin({ provider } = {}) {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = base64url(randomBytes(16));

  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${CALLBACK_PORT}`);

      if (url.pathname !== '/callback') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const code = url.searchParams.get('code');
      const returnedState = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><body><h2>Login failed</h2><p>You can close this window.</p></body></html>');
        server.close();
        reject(new Error(`Auth error: ${error}`));
        return;
      }

      if (returnedState !== state) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><body><h2>Invalid state</h2><p>Please try again.</p></body></html>');
        server.close();
        reject(new Error('State mismatch — possible CSRF attack'));
        return;
      }

      try {
        // Exchange auth code for tokens
        const tokenRes = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: CLI_CLIENT_ID,
            code,
            redirect_uri: CALLBACK_URL,
            code_verifier: codeVerifier,
          }),
        });

        const tokens = await tokenRes.json();

        if (!tokenRes.ok || tokens.error) {
          throw new Error(tokens.error_description || tokens.error || 'Token exchange failed');
        }

        // Decode ID token payload (no verification needed client-side)
        const payload = JSON.parse(
          Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
        );

        const creds = {
          refreshToken: tokens.refresh_token,
          idToken: tokens.id_token,
          accessToken: tokens.access_token,
          expiresAt: Date.now() + tokens.expires_in * 1000,
          email: payload.email || payload['cognito:username'],
          sub: payload.sub,
        };

        saveCredentials(creds);

        res.writeHead(302, { Location: 'https://app.trucontext.ai' });
        res.end();

        server.close();
        resolve(creds);
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<html><body><h2>Login failed</h2><p>${err.message}</p></body></html>`);
        server.close();
        reject(err);
      }
    });

    server.listen(CALLBACK_PORT, () => {
      const authorizeUrl = new URL(`${COGNITO_DOMAIN}/oauth2/authorize`);
      authorizeUrl.searchParams.set('response_type', 'code');
      authorizeUrl.searchParams.set('client_id', CLI_CLIENT_ID);
      authorizeUrl.searchParams.set('redirect_uri', CALLBACK_URL);
      authorizeUrl.searchParams.set('scope', 'email openid profile');
      authorizeUrl.searchParams.set('code_challenge', codeChallenge);
      authorizeUrl.searchParams.set('code_challenge_method', 'S256');
      authorizeUrl.searchParams.set('state', state);

      // Skip hosted UI and go straight to provider if specified
      if (provider) {
        authorizeUrl.searchParams.set('identity_provider', provider);
      }

      open(authorizeUrl.toString());
    });

    // Timeout after 2 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('Login timed out — no callback received within 2 minutes'));
    }, 120000);
  });
}

/**
 * Refresh tokens using the stored refresh token.
 * Returns the new ID token.
 */
export async function refreshTokens() {
  const creds = getCredentials();
  if (!creds?.refreshToken) {
    throw new Error('Not logged in. Run: trucontext login');
  }

  const res = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: CLI_CLIENT_ID,
      refresh_token: creds.refreshToken,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error_description || data.error || 'Token refresh failed. Run: trucontext login');
  }

  saveCredentials({
    ...creds,
    idToken: data.id_token,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    // Cognito does NOT return a new refresh_token on refresh — keep the original
  });

  return data.id_token;
}

/**
 * Get a valid ID token, refreshing if needed.
 */
export async function ensureFreshToken() {
  const creds = getCredentials();
  if (!creds) {
    throw new Error('Not logged in. Run: trucontext login');
  }

  // Refresh if within 60 seconds of expiry
  if (Date.now() > (creds.expiresAt || 0) - 60000) {
    return await refreshTokens();
  }

  return creds.idToken;
}
