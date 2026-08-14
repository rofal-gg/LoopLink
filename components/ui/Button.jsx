import Link from "next/link";

const VARIANTS = {
  primary:
    "bg-loop-primary text-loop-base shadow-[0_3px_12px_rgba(60,122,92,0.4)] hover:bg-loop-primary-hover hover:-translate-y-[2px] hover:shadow-[0_8px_22px_rgba(60,122,92,0.5)] active:translate-y-0",
  secondary:
    "border border-loop-mist bg-white text-loop-ink hover:border-loop-primary/50 hover:bg-loop-base",
  ghost:
    "text-loop-primary hover:bg-loop-mist/60 hover:text-loop-primary-hover",
  danger: "bg-red-700 text-white hover:bg-red-800",
};

const SIZES = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

const BASE =
  "fr inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98]";

function Spinner({ className = "h-4 w-4" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <Link
      href={href}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}