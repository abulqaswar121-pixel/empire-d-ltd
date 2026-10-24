import { createFileRoute, redirect } from "@tanstack/react-router";

// Static page (public/thank-you/index.html) — keep the clean URL working in the preview.
export const Route = createFileRoute("/thank-you")({
  beforeLoad: () => {
    throw redirect({ href: "/thank-you/index.html" });
  },
});
