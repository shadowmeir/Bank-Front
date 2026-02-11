import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";

import { API_BASE_URL, getToken } from "./api";

/**
 * Default hub path used by the backend.
 * If you ever change the backend mapping, you can override it by setting:
 *   VITE_CHATBOT_HUB_PATH=/hubs/chat
 */
const HUB_PATH = (import.meta.env.VITE_CHATBOT_HUB_PATH ?? "/hubs/chat").trim();

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export type ChatMessage = {
  id: string;
  role: "user" | "bot" | "system";
  text: string;
  at: number; // epoch ms
};

export type ChatbotConnection = {
  conn: HubConnection;
  isConnected: () => boolean;
};

export function createChatbotConnection(): ChatbotConnection {
  const url = joinUrl(API_BASE_URL, HUB_PATH);

  // IMPORTANT: SignalR will use HTTP negotiate first, then upgrade to WS.
  // The access token is sent as Authorization header (and via query string when WS).
  const conn = new HubConnectionBuilder()
    .withUrl(url, {
      accessTokenFactory: () => getToken() ?? "",
      // Prefer WebSockets; allow fallback (LongPolling) in restrictive environments.
      transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

  return {
    conn,
    isConnected: () => conn.state === HubConnectionState.Connected,
  };
}
