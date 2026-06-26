import { useEffect, useState } from "react";
import { Download, MessageSquare, CheckCircle, AlertTriangle, Terminal, Wallet, Eye } from "lucide-react";
import { getModInfo, getApprovedComments, submitComment } from "../lib/api";

interface ModInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  download_url: string | null;
  install_instructions: string;
}

interface CommentItem {
  id: string;
  username: string;
  comment: string;
  created_at: string;
}

export function HomePage() {
  const [modInfo, setModInfo] = useState<ModInfo | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [username, setUsername] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [mod, comms] = await Promise.all([getModInfo(), getApprovedComments()]);
        setModInfo(mod);
        setComments(comms || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !commentText.trim()) return;
    try {
      await submitComment(username.trim(), commentText.trim());
      setSubmitStatus("success");
      setUsername("");
      setCommentText("");
    } catch {
      setSubmitStatus("error");
    }
  }

  const instructions = modInfo?.install_instructions
    ? modInfo.install_instructions.split("\n")
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="pixel-font text-[var(--mc-green-light)] text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="mc-card p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="mc-badge mc-badge-green">{modInfo?.version || "1.21.1 Fabric"}</span>
              <span className="mc-badge mc-badge-yellow">Client-Side</span>
            </div>
            <h2 className="pixel-font text-[var(--mc-green-light)] text-xl md:text-2xl mb-4 leading-relaxed">
              {modInfo?.name || "DonutSMP Fake Pay Mod"}
            </h2>
            <p className="text-[var(--mc-text)] leading-relaxed mb-6">
              {modInfo?.description ||
                "A client-side Fabric mod for DonutSMP that displays fake /pay commands and fake /bal balance."}
            </p>
            <div className="flex items-center gap-3 text-[var(--mc-green-light)] bg-[rgba(85,170,85,0.1)] border border-[var(--mc-green)] rounded p-3 mb-6">
              <AlertTriangle size={20} />
              <span className="text-sm font-medium">This mod is for DonutSMP (client-side only)</span>
            </div>
            {modInfo?.download_url ? (
              <a
                href={modInfo.download_url}
                download
                className="mc-btn flex items-center gap-3 inline-block"
              >
                <Download size={16} />
                Download Mod
              </a>
            ) : (
              <button
                className="mc-btn flex items-center gap-3 opacity-50 cursor-not-allowed"
                disabled
              >
                <Download size={16} />
                Download Not Available
              </button>
            )}
          </div>
          <div className="md:w-72 shrink-0">
            <div className="bg-[var(--mc-surface-light)] border-2 border-[var(--mc-border)] rounded-lg p-4">
              <h3 className="pixel-font text-[var(--mc-green-light)] text-xs mb-4">Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Terminal size={16} className="text-[var(--mc-green)] mt-0.5 shrink-0" />
                  <span className="text-sm text-[var(--mc-text)]">Fake /pay command display</span>
                </li>
                <li className="flex items-start gap-3">
                  <Wallet size={16} className="text-[var(--mc-green)] mt-0.5 shrink-0" />
                  <span className="text-sm text-[var(--mc-text)]">Fake /bal balance display</span>
                </li>
                <li className="flex items-start gap-3">
                  <Eye size={16} className="text-[var(--mc-green)] mt-0.5 shrink-0" />
                  <span className="text-sm text-[var(--mc-text)]">Client-side only — safe on DonutSMP</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Install Guide */}
      <section className="mc-card p-6 md:p-8 mb-8">
        <h3 className="pixel-font text-[var(--mc-green-light)] text-sm mb-6">Installation Guide</h3>
        <ol className="space-y-4">
          {instructions.map((step, i) => {
            const isLink = step.includes("https://");
            const urlMatch = step.match(/https:\/\/[^\s]+/);
            return (
              <li key={i} className="flex items-start gap-4">
                <span className="w-8 h-8 shrink-0 bg-[var(--mc-green-dark)] border border-[var(--mc-green)] rounded flex items-center justify-center text-xs pixel-font text-white">
                  {i + 1}
                </span>
                <div className="pt-1.5 text-[var(--mc-text)] text-sm leading-relaxed">
                  {isLink && urlMatch ? (
                    <>
                      {step.split(urlMatch[0])[0]}
                      <a
                        href={urlMatch[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--mc-green-light)] underline hover:text-[var(--mc-green)]"
                      >
                        {urlMatch[0]}
                      </a>
                      {step.split(urlMatch[0])[1]}
                    </>
                  ) : (
                    step
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Comments */}
      <section className="mc-card p-6 md:p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare size={18} className="text-[var(--mc-green)]" />
          <h3 className="pixel-font text-[var(--mc-green-light)] text-sm">Comments & Reviews</h3>
        </div>

        {comments.length === 0 ? (
          <p className="text-[var(--mc-text-muted)] text-sm mb-6">No comments yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4 mb-8">
            {comments.map((c) => (
              <div key={c.id} className="bg-[var(--mc-surface-light)] border border-[var(--mc-border)] rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[var(--mc-green-light)] text-sm">{c.username}</span>
                  <span className="text-[var(--mc-text-muted)] text-xs">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[var(--mc-text)] text-sm whitespace-pre-wrap">{c.comment}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[var(--mc-surface-light)] border border-[var(--mc-border)] rounded p-4">
          <h4 className="pixel-font text-[var(--mc-text)] text-xs mb-4">Leave a Comment</h4>
          <div className="space-y-4">
            <input
              className="mc-input"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={32}
              required
            />
            <textarea
              className="mc-input mc-textarea"
              placeholder="Write your review..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={500}
              required
            />
            <div className="flex items-center justify-between">
              <button type="submit" className="mc-btn">
                Submit
              </button>
              {submitStatus === "success" && (
                <span className="flex items-center gap-2 text-[var(--mc-green-light)] text-sm">
                  <CheckCircle size={16} />
                  Submitted for moderation
                </span>
              )}
              {submitStatus === "error" && (
                <span className="text-red-400 text-sm">Failed to submit. Try again.</span>
              )}
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
