export function Footer() {
  return (
    <footer className="border-t-2 border-[var(--mc-border)] bg-[var(--mc-surface)] mt-12">
      <div className="max-w-5xl mx-auto px-4 py-6 text-center">
        <p className="text-[var(--mc-text-muted)] text-xs pixel-font">
          Not affiliated with Mojang or DonutSMP
        </p>
        <p className="text-[var(--mc-text-muted)] text-xs mt-2">
          For Minecraft 1.21.1 with Fabric Loader
        </p>
      </div>
    </footer>
  );
}
