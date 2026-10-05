export interface Link {
  id: string;
  code: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const listLinks = () => request<Link[]>("/api/links");

export const createLink = (url: string) =>
  request<Link>("/api/links", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
