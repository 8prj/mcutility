import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Trash2,
  Save,
  LogOut,
  MessageSquare,
  FileText,
  Clock,
  Check,
  Upload,
} from "lucide-react";
import {
  getModInfo,
  getAllComments,
  updateCommentStatus,
  deleteComment,
  updateModInfo,
  uploadModFile,
} from "../lib/api";

interface ModInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  install_instructions: string;
  download_url: string | null;
}

interface CommentItem {
  id: string;
  username: string;
  comment: string;
  status: "pending" | "approved";
  created_at: string;
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");

  const [modInfo, setModInfo] = useState<ModInfo | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [activeTab, setActiveTab] = useState<"mod" | "pending" | "approved">("mod");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [downloadUrlInput, setDownloadUrlInput] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: "",
    version: "",
    install_instructions: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }
    loadData();
  }, [token, navigate]);

  async function loadData() {
    try {
      const [mod, comms] = await Promise.all([getModInfo(), getAllComments()]);
      setModInfo(mod);
      setComments(comms || []);
      if (mod) {
        setForm({
          name: mod.name || "",
          description: mod.description || "",
          version: mod.version || "",
          install_instructions: mod.install_instructions || "",
        });
      }
    } catch (e) {
      console.error(e);
      if ((e as Error).message.includes("Unauthorized")) {
        localStorage.removeItem("admin_token");
        navigate("/admin");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveMod() {
    setSaveStatus("idle");
    try {
      await updateModInfo(form);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  }

  async function handleFileUpload() {
    const url = downloadUrlInput.trim();
    if (!url) return;

    setUploadStatus("uploading");
    try {
      await uploadModFile(url);
      setUploadStatus("success");
      setDownloadUrlInput("");
      setTimeout(() => setUploadStatus("idle"), 2000);
      // Reload mod info to get updated download URL
      loadData();
    } catch {
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 2000);
    }
  }

  async function handleApprove(id: string) {
    try {
      await updateCommentStatus(id, "approved");
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "approved" } : c))
      );
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  function logout() {
    localStorage.removeItem("admin_token");
    navigate("/admin");
  }

  const pendingComments = comments.filter((c) => c.status === "pending");
  const approvedComments = comments.filter((c) => c.status === "approved");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="pixel-font text-[var(--mc-green-light)] text-sm animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="pixel-font text-[var(--mc-green-light)] text-lg">
          Admin Dashboard
        </h2>
        <button onClick={logout} className="mc-btn mc-btn-danger flex items-center gap-2">
          <LogOut size={14} />
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab("mod")}
          className={`mc-btn text-xs ${activeTab === "mod" ? "" : "opacity-60"}`}
        >
          <FileText size={14} className="inline mr-2" />
          Mod Info
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`mc-btn text-xs ${activeTab === "pending" ? "" : "opacity-60"}`}
        >
          <Clock size={14} className="inline mr-2" />
          Pending ({pendingComments.length})
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`mc-btn text-xs ${activeTab === "approved" ? "" : "opacity-60"}`}
        >
          <Check size={14} className="inline mr-2" />
          Approved ({approvedComments.length})
        </button>
      </div>

      {/* Mod Info Tab */}
      {activeTab === "mod" && (
        <div className="mc-card p-6">
          <h3 className="pixel-font text-[var(--mc-green-light)] text-xs mb-6">
            Edit Mod Information
          </h3>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-[var(--mc-text-muted)] text-xs mb-2 pixel-font">
                Mod Name
              </label>
              <input
                className="mc-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[var(--mc-text-muted)] text-xs mb-2 pixel-font">
                Version
              </label>
              <input
                className="mc-input"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[var(--mc-text-muted)] text-xs mb-2 pixel-font">
                Description
              </label>
              <textarea
                className="mc-input mc-textarea"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[var(--mc-text-muted)] text-xs mb-2 pixel-font">
                Installation Instructions
              </label>
              <textarea
                className="mc-input mc-textarea"
                rows={8}
                value={form.install_instructions}
                onChange={(e) =>
                  setForm({ ...form, install_instructions: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleSaveMod} className="mc-btn flex items-center gap-2">
                <Save size={14} />
                Save Changes
              </button>
              {saveStatus === "saved" && (
                <span className="flex items-center gap-2 text-[var(--mc-green-light)] text-sm">
                  <CheckCircle size={16} />
                  Saved!
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-red-400 text-sm">Save failed.</span>
              )}
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mt-8 pt-8 border-t border-[var(--mc-border)]">
            <h3 className="pixel-font text-[var(--mc-green-light)] text-xs mb-4">
              Set Download URL
            </h3>
            <div className="space-y-4">
              {modInfo?.download_url && (
                <div className="bg-[var(--mc-surface-light)] border border-[var(--mc-border)] rounded p-4">
                  <p className="text-[var(--mc-text-muted)] text-xs mb-2">Current download URL:</p>
                  <p className="text-[var(--mc-green-light)] text-sm break-all">{modInfo.download_url}</p>
                </div>
              )}
              <div>
                <label className="block text-[var(--mc-text-muted)] text-xs mb-2 pixel-font">
                  Download URL (GitHub Releases, direct link, etc.)
                </label>
                <input
                  type="text"
                  value={downloadUrlInput}
                  onChange={(e) => setDownloadUrlInput(e.target.value)}
                  placeholder="https://github.com/..."
                  className="mc-input"
                  disabled={uploadStatus === "uploading"}
                />
              </div>
              <button
                onClick={handleFileUpload}
                className="mc-btn"
                disabled={uploadStatus === "uploading" || !downloadUrlInput.trim()}
              >
                {uploadStatus === "uploading" ? "Updating..." : "Update Download URL"}
              </button>
              {uploadStatus === "success" && (
                <span className="flex items-center gap-2 text-[var(--mc-green-light)] text-sm">
                  <CheckCircle size={16} />
                  Download URL updated successfully!
                </span>
              )}
              {uploadStatus === "error" && (
                <span className="text-red-400 text-sm">Update failed. Please try again.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pending Comments Tab */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingComments.length === 0 ? (
            <div className="mc-card p-8 text-center text-[var(--mc-text-muted)]">
              <MessageSquare size={32} className="mx-auto mb-4 opacity-50" />
              <p className="pixel-font text-sm">No pending comments</p>
            </div>
          ) : (
            pendingComments.map((c) => (
              <div
                key={c.id}
                className="mc-card p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-[var(--mc-green-light)] text-sm">
                      {c.username}
                    </span>
                    <span className="mc-badge mc-badge-yellow">Pending</span>
                    <span className="text-[var(--mc-text-muted)] text-xs">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[var(--mc-text)] text-sm whitespace-pre-wrap">
                    {c.comment}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(c.id)}
                    className="mc-btn flex items-center gap-2 text-xs"
                  >
                    <CheckCircle size={14} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="mc-btn mc-btn-danger flex items-center gap-2 text-xs"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Approved Comments Tab */}
      {activeTab === "approved" && (
        <div className="space-y-4">
          {approvedComments.length === 0 ? (
            <div className="mc-card p-8 text-center text-[var(--mc-text-muted)]">
              <MessageSquare size={32} className="mx-auto mb-4 opacity-50" />
              <p className="pixel-font text-sm">No approved comments</p>
            </div>
          ) : (
            approvedComments.map((c) => (
              <div
                key={c.id}
                className="mc-card p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-[var(--mc-green-light)] text-sm">
                      {c.username}
                    </span>
                    <span className="mc-badge mc-badge-green">Approved</span>
                    <span className="text-[var(--mc-text-muted)] text-xs">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[var(--mc-text)] text-sm whitespace-pre-wrap">
                    {c.comment}
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="mc-btn mc-btn-danger flex items-center gap-2 text-xs"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
