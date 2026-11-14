import { useField } from "formik";

/** Champ Formik avec libellé et message d'erreur. Passer as="textarea" ou as="select" si besoin. */
export default function FormField({
  label,
  as = "input",
  hint,
  children,
  className = "",
  ...props
}) {
  const [field, meta] = useField(props);
  const Component = as;
  const hasError = meta.touched && meta.error;
  const id = props.id ?? props.name;

  return (
    <div className={className}>
      {label && (
        <label className="label" htmlFor={id}>
          {label}
        </label>
      )}
      <Component
        id={id}
        className={`input ${hasError ? "input-error" : ""} ${as === "textarea" ? "resize-y" : ""}`}
        aria-invalid={Boolean(hasError)}
        {...field}
        {...props}
      >
        {children}
      </Component>
      {hasError ? (
        <p className="field-error">{meta.error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-dark/50">{hint}</p>
      )}
    </div>
  );
}
