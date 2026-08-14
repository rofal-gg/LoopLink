"use client";

import { useState } from "react";
import {
  IconAlert,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconInfo,
} from "@/components/icons";

const INPUT_BASE =
  "w-full rounded-xl border bg-loop-base px-3.5 py-2.5 text-sm text-loop-ink shadow-sm outline-none transition placeholder:text-loop-line/70 focus:border-loop-primary focus:ring-4 focus:ring-loop-primary/15 disabled:opacity-60";

function borderClass(error) {
  return error
    ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
    : "border-loop-mist";
}

function useFieldIds(label, name, id) {
  const slug = (
    id ||
    name ||
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );
  return {
    inputId: slug,
    errorId: `${slug}-error`,
    hintId: `${slug}-hint`,
  };
}

function FieldMessages({ error, hint, inputId, errorId, hintId }) {
  if (error) {
    return (
      <p
        id={errorId}
        className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-700"
      >
        <IconAlert className="mt-px h-3.5 w-3.5 shrink-0" />
        <span>{error}</span>
      </p>
    );
  }
  if (hint) {
    return (
      <p id={hintId} className="mt-1.5 text-xs text-loop-line">
        {hint}
      </p>
    );
  }
  return null;
}

export function TextInput({
  label,
  name,
  id,
  error,
  hint,
  required = false,
  className = "",
  containerClassName = "",
  ...props
}) {
  const { inputId, errorId, hintId } = useFieldIds(label, name, id);
  const describedBy =
    [error ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={containerClassName}>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-semibold text-loop-ink"
      >
        {label}
        {required && <span className="ml-0.5 text-loop-primary">*</span>}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${INPUT_BASE} ${borderClass(error)} ${className}`}
        {...props}
      />
      <FieldMessages
        error={error}
        hint={hint}
        inputId={inputId}
        errorId={errorId}
        hintId={hintId}
      />
    </div>
  );
}

export function PasswordInput({
  label = "Kata sandi",
  name = "password",
  id,
  error,
  hint,
  required = false,
  className = "",
  containerClassName = "",
  autoComplete = "current-password",
  ...props
}) {
  const [show, setShow] = useState(false);
  const { inputId, errorId, hintId } = useFieldIds(label, name, id);
  const describedBy =
    [error ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={containerClassName}>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-semibold text-loop-ink"
      >
        {label}
        {required && <span className="ml-0.5 text-loop-primary">*</span>}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${INPUT_BASE} pr-11 ${borderClass(error)} ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          className="fr absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-loop-line hover:text-loop-ink"
        >
          {show ? (
            <IconEyeOff className="h-4 w-4" />
          ) : (
            <IconEye className="h-4 w-4" />
          )}
        </button>
      </div>
      <FieldMessages
        error={error}
        hint={hint}
        inputId={inputId}
        errorId={errorId}
        hintId={hintId}
      />
    </div>
  );
}

export function TextArea({
  label,
  name,
  id,
  error,
  hint,
  required = false,
  className = "",
  containerClassName = "",
  rows = 3,
  ...props
}) {
  const { inputId, errorId, hintId } = useFieldIds(label, name, id);
  const describedBy =
    [error ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={containerClassName}>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-semibold text-loop-ink"
      >
        {label}
        {required && <span className="ml-0.5 text-loop-primary">*</span>}
      </label>
      <textarea
        id={inputId}
        name={name}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${INPUT_BASE} resize-y ${borderClass(error)} ${className}`}
        {...props}
      />
      <FieldMessages
        error={error}
        hint={hint}
        inputId={inputId}
        errorId={errorId}
        hintId={hintId}
      />
    </div>
  );
}

const ALERT_STYLES = {
  error: "border-red-200 bg-red-50 text-red-800",
  success:
    "border-loop-primary/40 bg-loop-primary/10 text-loop-primary-hover",
  info: "border-loop-mist bg-loop-base text-loop-ink",
};

export function Alert({ variant = "info", children, className = "" }) {
  const Icon = variant === "error" ? IconAlert : variant === "success" ? IconCheck : IconInfo;
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${ALERT_STYLES[variant]} ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}