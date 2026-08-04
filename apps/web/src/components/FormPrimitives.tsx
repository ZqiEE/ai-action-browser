import { useId, type InputHTMLAttributes, type ReactNode } from "react";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  description?: string;
  error?: string;
}

export function TextField({ label, description, error, ...props }: TextFieldProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>{label}</label>
      <input
        {...props}
        id={id}
        className="field__input"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      />
      {description && <p id={descriptionId} className="field__description">{description}</p>}
      {error && <p id={errorId} className="field__error" role="alert">{error}</p>}
    </div>
  );
}

export type StatusTone = "neutral" | "progress" | "success" | "warning" | "danger" | "info";

interface StatusProps {
  tone?: StatusTone;
  children: ReactNode;
  live?: "off" | "polite" | "assertive";
  className?: string;
}

export function Status({ tone = "neutral", children, live = "polite", className = "" }: StatusProps) {
  return (
    <div
      className={`status status--${tone} ${className}`.trim()}
      role={tone === "danger" ? "alert" : "status"}
      aria-live={live}
    >
      {children}
    </div>
  );
}
