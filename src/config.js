// config.js — Credential and configuration management
// Stores credentials and config in ~/.trucontext/

import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync, chmodSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const CONFIG_DIR = join(homedir(), '.trucontext');
const CREDENTIALS_FILE = join(CONFIG_DIR, 'credentials.json');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

// Cognito + API endpoints
export const COGNITO_DOMAIN = 'https://auth.trucontext.ai';
export const CLI_CLIENT_ID = '4tn43b2p32bh3t9tcstrrsi7fo';
export const CALLBACK_PORT = 8181;
export const CALLBACK_URL = `http://localhost:${CALLBACK_PORT}/callback`;
export const DATA_PLANE_URL = 'https://api.trucontext.ai';
export const CONTROL_PLANE_URL = 'https://platform.trucontext.ai';

function ensureDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

// --- Credentials ---

export function getCredentials() {
  try {
    return JSON.parse(readFileSync(CREDENTIALS_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

export function saveCredentials(creds) {
  ensureDir();
  writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2));
  chmodSync(CREDENTIALS_FILE, 0o600);
}

export function clearCredentials() {
  try {
    unlinkSync(CREDENTIALS_FILE);
  } catch {
    // Already gone
  }
}

// --- Config ---

export function getConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveConfig(config) {
  ensureDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getActiveApp() {
  return getConfig().activeApp || null;
}

export function setActiveApp(appId) {
  const config = getConfig();
  config.activeApp = appId;
  saveConfig(config);
}

// --- Terms Acceptance ---

export function hasAcceptedTerms() {
  const config = getConfig();
  return !!config.termsAcceptedAt;
}

export function recordTermsAcceptance() {
  const config = getConfig();
  config.termsAcceptedAt = new Date().toISOString();
  config.termsVersion = '2026-03-22';
  saveConfig(config);
}
