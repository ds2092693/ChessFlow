export function getBackendUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3000';
    }
  }
  return 'https://chessflow-backend.onrender.com';
}

export function getWsUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'ws://localhost:8080';
    }
  }
  return 'wss://chessflow-ws.onrender.com';
}

export const BACKEND_URL = getBackendUrl();
export const WS_URL = getWsUrl();
