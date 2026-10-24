import { createFileRoute, redirect } from "@tanstack/react-router";

// Static page (public/education/index.html) — keep the clean URL working in the preview.
export const Route = createFileRoute("/education")({
  beforeLoad: () => {
    throw redirect({ href: "/education/index.html" });
  },
});
