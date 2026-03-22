// client.js — HTTP client for both API planes
// Auto-refreshes JWT, attaches active app header.

import { ensureFreshToken } from './auth.js';
import { getActiveApp, DATA_PLANE_URL, CONTROL_PLANE_URL } from './config.js';

async function request(baseUrl, method, path, body, retry = true) {
  const token = await ensureFreshToken();
  const activeApp = getActiveApp();

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (activeApp) {
    headers['X-TruContext-App'] = activeApp;
  }

  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), 15000);

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: ac.signal,
    });

    // Retry once on 401 after refresh
    if (res.status === 401 && retry) {
      const newToken = await ensureFreshToken();
      headers['Authorization'] = `Bearer ${newToken}`;
      const retryRes = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: ac.signal,
      });
      return handleResponse(retryRes);
    }

    return handleResponse(res);
  } finally {
    clearTimeout(timeout);
  }
}

async function handleResponse(res) {
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// --- Public API ---

export function dataPlane(method, path, body) {
  return request(DATA_PLANE_URL, method, path, body);
}

export function controlPlane(method, path, body) {
  return request(CONTROL_PLANE_URL, method, path, body);
}
