import { Link } from "react-router-dom";
import { Shield, Home } from "lucide-react";

export function Header() {
  return (
    <header className="border-b-2 border-[var(--mc-border)] bg-[var(--mc-surface)]">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[var(--mc-green-dark)] border-2 border-[var(--mc-green)] rounded flex items-center justify-center group-hover:bg-[var(--mc-green)] transition-colors">
            <span className="pixel-font text-white text-xs">DS</span>
          </div>
          <div>
            <h1 className="pixel-font text-[var(--mc-green-light)] text-sm tracking-tight">
              DonutSMP
            </h1>
            <p className="text-[var(--mc-text-muted)] text-xs">Mod Downloads</p>
          </div>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-[var(--mc-text-muted)] hover:text-[var(--mc-green-light)] transition-colors text-sm"
          >
            <Home size={16} />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link
            to="/admin"
            className="flex items-center gap-2 text-[var(--mc-text-muted)] hover:text-[var(--mc-green-light)] transition-colors text-sm"
          >
            <Shield size={16} />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
