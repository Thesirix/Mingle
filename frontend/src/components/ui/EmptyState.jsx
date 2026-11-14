import { FiInbox } from "react-icons/fi";

export default function EmptyState({ icon: Icon = FiInbox, title, children, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-dark/10 bg-white/60 px-6 py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-light text-2xl text-primary">
        <Icon />
      </span>
      <h3 className="text-lg">{title}</h3>
      {children && <p className="mt-2 max-w-md text-sm text-dark/60">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
