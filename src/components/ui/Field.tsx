import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";
import "./Field.css";

interface FieldWrapProps {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function Field({ label, required, hint, error, htmlFor, children }: FieldWrapProps) {
  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      {label && (
        <label className="field__label" htmlFor={htmlFor}>
          {label} {required && <span className="field__req">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="field__msg field__msg--error">
          <i className="bi bi-exclamation-circle" aria-hidden /> {error}
        </span>
      ) : (
        hint && <span className="field__msg">{hint}</span>
      )}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
};

export function Input({ label, required, hint, error, id, className = "", ...rest }: InputProps) {
  return (
    <Field label={label} required={required} hint={hint} error={error} htmlFor={id}>
      <input id={id} className={`control ${className}`} {...rest} />
    </Field>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
};

export function Textarea({ label, required, hint, error, id, className = "", ...rest }: TextareaProps) {
  return (
    <Field label={label} required={required} hint={hint} error={error} htmlFor={id}>
      <textarea id={id} className={`control control--textarea ${className}`} {...rest} />
    </Field>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function Select({
  label,
  required,
  hint,
  error,
  id,
  options,
  placeholder,
  className = "",
  ...rest
}: SelectProps) {
  return (
    <Field label={label} required={required} hint={hint} error={error} htmlFor={id}>
      <div className="control-select-wrap">
        <select id={id} className={`control control--select ${className}`} {...rest}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <i className="bi bi-chevron-down control-select-caret" aria-hidden />
      </div>
    </Field>
  );
}

export function Checkbox({
  label,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="choice" htmlFor={id}>
      <input type="checkbox" id={id} {...rest} />
      <span>{label}</span>
    </label>
  );
}

export function Radio({
  label,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="choice" htmlFor={id}>
      <input type="radio" id={id} {...rest} />
      <span>{label}</span>
    </label>
  );
}
