import { ENV } from "./_core/env";

export interface XtreamNewAccountResponse {
  status: string;
  user_id: string;
  notes: string;
  country: string;
  message: string;
  url: string;
}

export interface XtreamRenewResponse {
  status: string;
  messasge?: string;
  message?: string;
}

/**
 * Create a new M3U account via the Xtream Code API.
 */
export async function createXtreamAccount(options: {
  sub: number; // 1, 3, 6, or 12 months
  notes?: string;
  country?: string;
}): Promise<{ username: string; password: string; url: string; rawResponse: XtreamNewAccountResponse }> {
  const params = new URLSearchParams({
    action: "new",
    type: "m3u",
    sub: String(options.sub),
    pack: ENV.xtreamPackageId,
    api_key: ENV.xtreamApiKey,
  });

  if (options.notes) params.set("notes", options.notes);
  if (options.country) params.set("country", options.country);

  const url = `${ENV.xtreamApiUrl}?${params.toString()}`;
  const response = await fetch(url);
  const data = await response.json() as XtreamNewAccountResponse;

  if (data.status !== "true") {
    throw new Error(`Xtream API error: ${JSON.stringify(data)}`);
  }

  // Parse username and password from the returned URL
  const m3uUrl = new URL(data.url);
  const username = m3uUrl.searchParams.get("username") || "";
  const password = m3uUrl.searchParams.get("password") || "";

  return {
    username,
    password,
    url: data.url,
    rawResponse: data,
  };
}

/**
 * Renew an existing M3U account via the Xtream Code API.
 */
export async function renewXtreamAccount(options: {
  username: string;
  password: string;
  sub: number;
}): Promise<{ success: boolean; rawResponse: XtreamRenewResponse }> {
  const params = new URLSearchParams({
    action: "renew",
    type: "m3u",
    username: options.username,
    password: options.password,
    sub: String(options.sub),
    api_key: ENV.xtreamApiKey,
  });

  const url = `${ENV.xtreamApiUrl}?${params.toString()}`;
  const response = await fetch(url);
  const data = await response.json() as XtreamRenewResponse;

  return {
    success: data.status === "true",
    rawResponse: data,
  };
}
