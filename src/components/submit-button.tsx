"use client";

interface SubmitButtonProps {
  label: string;
  pendingLabel: string;
  pending: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function SubmitButton({ label, pendingLabel, pending, className, icon }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={className}
    >
      {icon && !pending && icon}
      {pending ? pendingLabel : label}
    </button>
  );
}
