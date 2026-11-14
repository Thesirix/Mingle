export default function Loader({ label = "Chargement…", className = "py-24" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-light border-t-primary" />
      <span className="text-sm font-medium text-dark/60">{label}</span>
    </div>
  );
}
