import { createFileRoute, redirect } from "@tanstack/react-router";

// Static page (public/logistics/index.html) — keep the clean URL working in the preview.
export const Route = createFileRoute("/logistics")({
  beforeLoad: () => {
    throw redirect({ href: "/logistics/index.html" });
  },
});
