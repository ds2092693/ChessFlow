const isBrowser = typeof window !== 'undefined';
const isLocalhost =
  isBrowser &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

function getBackendUrl(): string {
  if (import.meta.env.VITE_APP_BACKEND_URL) {
    const raw = import.meta.env.VITE_APP_BACKEND_URL;
    return raw.startsWith('http://') || raw.startsWith('https://')
      ? raw
      : `https://${raw}`;
  }
  if (!isLocalhost && isBrowser) {
    return window.location.origin;
  }
  return 'http://localhost:3000';
}

function getWsUrl(): string {
  if (import.meta.env.VITE_APP_WS_URL) {
    const raw = import.meta.env.VITE_APP_WS_URL;
    return raw.startsWith('ws://') || raw.startsWith('wss://')
      ? raw
      : `wss://${raw}`;
  }
  if (!isLocalhost && isBrowser) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }
  return 'ws://localhost:8080';
}

export const BACKEND_URL = getBackendUrl();
export const WS_URL = getWsUrl();
