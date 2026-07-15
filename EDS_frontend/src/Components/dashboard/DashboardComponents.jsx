export function Button({
  children,
  variant = "default",
  size = "default",
  className = "",
  isActive = false,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-raleway font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]";
  const variants = {
    default: `bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] ${
      isActive ? "text-white shadow-lg" : "text-white"
    } hover:from-[var(--color-primary-hover)] hover:to-[var(--color-primary-hover)] shadow-md hover:shadow-lg`,
    ghost: `bg-transparent ${
      isActive
        ? "text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]"
        : "text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-tertiary)] hover:text-[var(--theme-text-primary)]"
    }`,
    outline:
      "bg-transparent border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white",
  };
  const sizes = {
    default: "px-6 py-3 text-base",
    sm: "px-4 py-2 text-sm",
  };
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`px-6 pt-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3
      className={`text-xl font-raleway font-semibold text-[var(--theme-text-primary)] tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-[var(--theme-border-medium)] px-4 py-3 text-sm font-raleway text-[var(--theme-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all duration-200 bg-[var(--theme-bg-tertiary)] ${className}`}
      {...props}
    />
  );
}

export function Progress({ value, className = "", ...props }) {
  return (
    <div
      className={`w-full h-4 bg-[var(--theme-bg-tertiary)] rounded-full overflow-hidden ${className}`}
      {...props}
    >
      <div
        className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-full transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}