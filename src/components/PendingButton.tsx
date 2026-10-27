"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

/** A submit button that disables itself while its form's server action runs. */
export function PendingButton(props: ComponentProps<"button">) {
  const { pending } = useFormStatus();
  return <button type="submit" {...props} disabled={pending || props.disabled} aria-busy={pending} />;
}
