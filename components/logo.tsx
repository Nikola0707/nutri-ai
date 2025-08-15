export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="rounded-2xl gradient-emerald flex items-center justify-center modern-shadow relative overflow-hidden"
        style={{ width: size, height: size }}
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" className="text-white">
          <path d="M12 2C8 2 5 5 5 9c0 5.25 3.5 8.5 7 8.5s7-3.25 7-8.5c0-4-3-7-7-7z" fill="currentColor" />
          <path
            d="M12 17.5c-1.5 0-3-1-4-2.5 1 1.5 2.5 2.5 4 2.5s3-1 4-2.5c-1 1.5-2.5 2.5-4 2.5z"
            fill="currentColor"
            fillOpacity="0.8"
          />
          <circle cx="12" cy="8" r="2" fill="currentColor" fillOpacity="0.6" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
      </div>
      <span className="font-heading font-black text-2xl text-neutral-dark tracking-tight">
        Nutri<span className="text-emerald-600">AI</span>
      </span>
    </div>
  )
}
