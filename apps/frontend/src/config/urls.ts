const rawBackend = import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';
export const BACKEND_URL =
  rawBackend.startsWith('http://') || rawBackend.startsWith('https://')
    ? rawBackend
    : `https://${rawBackend}`;

const rawWs = import.meta.env.VITE_APP_WS_URL ?? 'ws://localhost:8080';
export const WS_URL =
  rawWs.startsWith('ws://') || rawWs.startsWith('wss://')
    ? rawWs
    : `wss://${rawWs}`;
