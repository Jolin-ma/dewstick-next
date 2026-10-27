import { notFound } from "next/navigation";

// Any URL no other route matches renders [lang]/not-found inside the site layout.
export default function CatchAll() {
  notFound();
}
