'use client';

import { Check, X } from 'lucide-react';

interface PasswordRequirementsProps {
  password: string;
}

export function checkPasswordStrength(password: string) {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);

  const passedCount = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  let strengthLabel = 'Weak';
  let strengthColor = 'bg-destructive';
  let strengthPercent = (passedCount / 5) * 100;

  if (passedCount === 5) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
  } else if (passedCount >= 3) {
    strengthLabel = 'Medium';
    strengthColor = 'bg-amber-500';
  }

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    passedCount,
    strengthLabel,
    strengthColor,
    strengthPercent,
    isComplete: passedCount === 5,
  };
}

export default function PasswordRequirements({
  password,
}: PasswordRequirementsProps) {
  if (!password) return null;

  const {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    strengthLabel,
    strengthColor,
    strengthPercent,
  } = checkPasswordStrength(password);

  const rules = [
    { label: 'At least 8 characters', met: hasMinLength },
    { label: 'One uppercase letter (A-Z)', met: hasUppercase },
    { label: 'One lowercase letter (a-z)', met: hasLowercase },
    { label: 'One number (0-9)', met: hasNumber },
    { label: 'One special symbol (!@#$%^&*)', met: hasSpecial },
  ];

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-border/80 bg-muted/30 p-3 text-xs animate-in fade-in duration-200">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          <span>Password Strength</span>
          <span className="font-semibold text-foreground">{strengthLabel}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${strengthPercent}%` }}
          />
        </div>
      </div>

      {/* Rules Checklist */}
      <ul className="grid grid-cols-1 gap-1 pt-1 sm:grid-cols-2">
        {rules.map((rule, idx) => (
          <li
            key={idx}
            className={`flex items-center gap-1.5 text-[11px] transition-colors ${
              rule.met
                ? 'font-medium text-emerald-600 dark:text-emerald-400'
                : 'text-muted-foreground'
            }`}
          >
            {rule.met ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            )}
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
