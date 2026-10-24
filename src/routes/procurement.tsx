import { createFileRoute, redirect } from "@tanstack/react-router";

// Static page (public/procurement/index.html) — keep the clean URL working in the preview.
export const Route = createFileRoute("/procurement")({
  beforeLoad: () => {
    throw redirect({ href: "/procurement/index.html" });
  },
});
