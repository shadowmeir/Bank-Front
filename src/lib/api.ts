const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5080").replace(/\/$/, "");

export type ProblemDetails = {
  title?: string;
  detail?: string;
  status?: number;
  traceId?: string;
};

export class ApiError extends Error {
  status: number;
  details?: ProblemDetails;

  constructor(status: number, message: string, details?: ProblemDetails) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function getToken(): string | null {
  return localStorage.getItem("bank_access_token");
}

export function setToken(token: string) {
  localStorage.setItem("bank_access_token", token);
}

export function clearToken() {
  localStorage.removeItem("bank_access_token");
}

export async function api<T>(
  path: string,
  options: RequestInit & {
    auth?: boolean;
    idempotencyKey?: string;
  } = {}
): Promise<T> {
  const { auth = true, idempotencyKey, headers, ...rest } = options;

  const h = new Headers(headers);

  // default JSON header if body exists
  if (rest.body && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getToken();
    if (token) h.set("Authorization", `Bearer ${token}`);
  }

  if (idempotencyKey) {
    h.set("Idempotency-Key", idempotencyKey);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers: h });

  if (!res.ok) {
    let pd: ProblemDetails | undefined;
    try {
      pd = (await res.json()) as ProblemDetails;
    } catch {
      // ignore
    }

    const msg = pd?.detail || pd?.title || `Request failed (${res.status})`;

    // If token is stale/invalid, prevent “stuck authed” UX
    if (res.status === 401) {
      clearToken();
    }

    throw new ApiError(res.status, msg, pd);
  }

  // handle empty response bodies safely
  const text = await res.text();
  return (text ? (JSON.parse(text) as T) : (null as T));
}