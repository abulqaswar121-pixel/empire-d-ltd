import { createFileRoute, redirect } from "@tanstack/react-router";

// Static page (public/about/index.html) — keep the clean URL working in the preview.
export const Route = createFileRoute("/about")({
  beforeLoad: () => {
    throw redirect({ href: "/about/index.html" });
  },
});
