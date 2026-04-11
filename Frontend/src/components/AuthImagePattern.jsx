const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="auth-side-panel relative hidden overflow-hidden lg:flex lg:items-center lg:justify-center lg:p-12">
      <div className="mesh-orb left-16 top-16 size-52 bg-[var(--accent)]" />
      <div className="mesh-orb bottom-14 right-16 size-56 bg-[var(--accent-strong)]" />

      <div className="relative z-10 max-w-xl">
        <div className="glass-panel rounded-[32px] p-8">
          <div className="mb-8 grid grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="rounded-[28px] border border-[var(--border)] bg-white/6 p-4">
                <div
                  className={`aspect-square rounded-[20px] ${
                    i % 3 === 0 ? "bg-[var(--accent)]/20" : i % 2 === 0 ? "bg-[var(--accent-strong)]/18" : "bg-white/10"
                  }`}
                />
              </div>
            ))}
          </div>

          <p className="text-xs uppercase tracking-[0.32em] text-[var(--text-muted)]">LoopTalk Design System</p>
          <h2 className="section-title mt-3 text-4xl font-bold">{title}</h2>
          <p className="mt-4 text-lg leading-8 text-[var(--text-soft)]">{subtitle}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Clean hierarchy", "Comfortable spacing", "Delightful motion"].map((label) => (
              <div key={label} className="rounded-2xl border border-[var(--border)] bg-white/6 px-4 py-3 text-sm font-medium text-[var(--text-soft)]">
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthImagePattern;
