"use client";

import { useState } from "react";

type Props = {
  strings: {
    label: string;
    placeholder: string;
    submit: string;
    invalid: string;
    demo: string;
  };
};

/** Validates the address and says it isn't stored: signups are collected on the Shopify store. */
export function NewsletterForm({ strings }: Props) {
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="small medium" role="status">
        {strings.demo}
      </p>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setDone(true);
        else {
          setError(true);
          e.currentTarget.querySelector("input")?.focus();
        }
      }}
    >
      <div className={`field-row${error ? " is-error" : ""}`}>
        <label className="visually-hidden" htmlFor="Newsletter-email">
          {strings.label}
        </label>
        <input
          id="Newsletter-email"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder={strings.placeholder}
          onInput={() => setError(false)}
        />
        <button type="submit" className="btn">
          {strings.submit}
        </button>
      </div>
      <p className="form-note" aria-live="polite">
        {error ? strings.invalid : ""}
      </p>
    </form>
  );
}
