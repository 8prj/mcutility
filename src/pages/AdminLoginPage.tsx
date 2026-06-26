import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock } from "lucide-react";
import { login } from "../lib/api";

export function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(password);
      if (res.token) {
        localStorage.setItem("admin_token", res.token);
        navigate("/admin/dashboard");
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Invalid password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="mc-card w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[var(--mc-green-dark)] border-2 border-[var(--mc-green)] rounded-lg flex items-center justify-center mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h2 className="pixel-font text-[var(--mc-green-light)] text-sm">Admin Login</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[var(--mc-text-muted)] text-xs mb-2 pixel-font">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mc-text-muted)]" />
              <input
                type="password"
                className="mc-input pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="mc-btn w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
