import styles from "./Header.module.css";

export default function SiteHeader() {
  return (
    <header
      className={[
        "relative isolate overflow-hidden pt-10",
        "min-h-[78vh] sm:min-h-[82vh]",
        "border-b border-white/10",
        "bg-[#120814]",
      ].join(" ")}
    >
      {/* Fondo romántico */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(1200px_500px_at_50%_-10%,rgba(255,120,180,0.20),transparent_60%),radial-gradient(900px_420px_at_15%_20%,rgba(244,114,182,0.14),transparent_55%),radial-gradient(900px_420px_at_85%_25%,rgba(192,132,252,0.12),transparent_55%),linear-gradient(to_bottom,rgba(18,8,20,0.96)_0%,rgba(28,10,24,0.96)_45%,rgba(16,8,18,0.98)_100%)]" />

      {/* Glow decorativo */}
      <div className={`${styles.glow} absolute -top-24 left-1/2 -z-10 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-pink-400/20 blur-3xl`} />
      <div className="absolute left-[10%] top-[22%] -z-10 h-36 w-36 rounded-full bg-rose-300/10 blur-3xl" />
      <div className="absolute right-[8%] top-[18%] -z-10 h-40 w-40 rounded-full bg-fuchsia-300/10 blur-3xl" />

      {/* Partículas / corazones sutiles */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <span className={`${styles.float1} absolute left-[12%] top-[20%] text-pink-200/30 text-lg`}>❤</span>
        <span className={`${styles.float2} absolute left-[22%] top-[60%] text-rose-200/20 text-sm`}>❤</span>
        <span className={`${styles.float3} absolute right-[18%] top-[28%] text-fuchsia-200/25 text-base`}>❤</span>
        <span className={`${styles.float4} absolute right-[10%] top-[65%] text-pink-100/20 text-sm`}>❤</span>
        <span className={`${styles.float2} absolute left-[50%] top-[14%] text-white/10 text-xs`}>✦</span>
        <span className={`${styles.float3} absolute left-[65%] top-[52%] text-white/10 text-xs`}>✦</span>
      </div>

      {/* Contenido */}
      <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-5xl flex-col items-center justify-center px-6 py-16 text-center sm:min-h-[82vh]">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-medium tracking-[0.24em] text-pink-100/75 uppercase backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-300 shadow-[0_0_14px_rgba(244,114,182,0.9)]" />
          Para alguien muy especial
        </p>

        <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl sm:leading-[1.05]">
          Hice este pequeño rincón del mundo
          <span className="block bg-gradient-to-r from-rose-200 via-pink-300 to-fuchsia-300 bg-clip-text text-transparent">
            solo para ti
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-pink-50/75 sm:text-lg sm:leading-8">
          Quería regalarte algo distinto, algo que puedas abrir cuando quieras
          y recordar lo mucho que significas para mí.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#carta"
            className="inline-flex items-center justify-center rounded-full border border-pink-200/20 bg-gradient-to-r from-rose-400/80 via-pink-400/80 to-fuchsia-400/80 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_40px_rgba(244,114,182,0.28)] transition duration-300 hover:scale-[1.02] hover:brightness-110"
          >
            Leer mi mensaje
          </a>

          <span className="text-xs tracking-[0.22em] uppercase text-pink-100/45">
            hecho con cariño
          </span>
        </div>

        {/* Scroll hint */}
        <div className="mt-14 flex flex-col items-center text-pink-100/45">
          <span className="text-[10px] uppercase tracking-[0.3em]">
            sigue bajando
          </span>
          <span className={`${styles.bounce} mt-3 text-lg`}>⌄</span>
        </div>
      </div>

      {/* Borde inferior decorativo */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pink-300/30 to-transparent" />
    </header>
  );
}