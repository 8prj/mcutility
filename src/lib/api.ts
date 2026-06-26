const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem("admin_token");
}

async function fetchJson(path: string, options?: RequestInit) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
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
  return fetchJson("/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function getModInfo() {
  return fetchJson("/mod-info");
}

export function getApprovedComments() {
  return fetchJson("/comments");
}

export function submitComment(username: string, comment: string) {
  return fetchJson("/comments", {
    method: "POST",
    body: JSON.stringify({ username, comment }),
  });
}

export function getAllComments() {
  return fetchJson("/admin/comments");
}

export function updateCommentStatus(id: string, status: "approved" | "pending") {
  return fetchJson(`/admin/comments/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export function deleteComment(id: string) {
  return fetchJson(`/admin/comments/${id}`, {
    method: "DELETE",
  });
}

export function updateModInfo(body: {
  name: string;
  description: string;
  version: string;
  install_instructions: string;
}) {
  return fetchJson("/admin/mod-info", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function uploadModFile(downloadUrl: string) {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return fetch(`${API_BASE}/admin/upload-mod`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ downloadUrl }),
  }).then((res) => res.json());
}
