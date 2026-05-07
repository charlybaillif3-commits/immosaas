"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * components/ui/input.tsx — Composant Input de base
 *
 * Rôle : champ de saisie stylisé et accessible.
 * - Étend tous les attributs natifs <input>.
 * - label : libellé accessible affiché au-dessus du champ.
 * - error : message d'erreur affiché en rouge sous le champ.
 * - hint : texte d'aide affiché en gris sous le champ.
 * - Le focus ring utilise la variable CSS --ring pour cohérence avec le thème.
 */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none text-foreground"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-destructive" aria-hidden>*</span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "input-base",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-destructive">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
