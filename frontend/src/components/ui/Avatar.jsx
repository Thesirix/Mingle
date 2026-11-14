import { assetUrl } from "@services/api";

const SIZES = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-xl",
  xl: "h-28 w-28 text-3xl",
};

const PALETTE = ["bg-primary", "bg-dark", "bg-accent", "bg-darkslategray"];

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

export default function Avatar({ src, name, size = "md", className = "" }) {
  const sizeClass = SIZES[size] ?? SIZES.md;
  const url = assetUrl(src);

  if (url) {
    return (
      <img
        src={url}
        alt={name ? `Photo de ${name}` : ""}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ring-white ${className}`}
      />
    );
  }

  const color = PALETTE[(name?.length ?? 0) % PALETTE.length];

  return (
    <span
      className={`${sizeClass} ${color} inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-2 ring-white ${className}`}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}
