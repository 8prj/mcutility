const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

function getToken() {
  return localStorage.getItem("admin_token");
}

async function fetchJson(options?: RequestInit) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    ...(options?.headers as Record<string, string>),
  };

  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-api`, {
    ...options,
    headers,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export function login(password: string) {
  return fetchJson({
    method: "POST",
    body: JSON.stringify({ action: 'login', password }),
  });
}

export function getModInfo() {
  return fetchJson({
    method: "POST",
    body: JSON.stringify({ action: 'get_mod_info' }),
  });
}

export function getApprovedComments() {
  return fetchJson({
    method: "POST",
    body: JSON.stringify({ action: 'get_comments' }),
  });
}

export function submitComment(username: string, comment: string) {
  return fetchJson({
    method: "POST",
    body: JSON.stringify({ action: 'submit_comment', username, comment }),
  });
}

export function getAllComments() {
  const token = getToken();
  return fetchJson({
    method: "POST",
    body: JSON.stringify({ action: 'get_all_comments', token }),
  });
}

export function updateCommentStatus(id: string, status: "approved" | "pending") {
  const token = getToken();
  return fetchJson({
    method: "POST",
    body: JSON.stringify({ action: 'update_comment', id, status, token }),
  });
}

export function deleteComment(id: string) {
  const token = getToken();
  return fetchJson({
    method: "POST",
    body: JSON.stringify({ action: 'delete_comment', id, token }),
  });
}

export function updateModInfo(body: {
  name: string;
  description: string;
  version: string;
  install_instructions: string;
}) {
  const token = getToken();
  return fetchJson({
    method: "POST",
    body: JSON.stringify({ action: 'update_mod_info', ...body, token }),
  });
}

export function uploadModFile(downloadUrl: string) {
  const token = getToken();
  return fetch(`${SUPABASE_URL}/functions/v1/admin-api`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action: 'update_download_url', downloadUrl, token }),
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((err) => {
        throw new Error(err.error || 'Upload failed');
      });
    }
    return res.json();
  });
}
