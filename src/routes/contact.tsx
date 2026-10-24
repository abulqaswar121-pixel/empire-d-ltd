import { createFileRoute, redirect } from "@tanstack/react-router";

// Static page (public/contact/index.html) — keep the clean URL working in the
// preview, preserving any query string (e.g. ?service=education preselects
// the service on the quote form).
export const Route = createFileRoute("/contact")({
  beforeLoad: ({ location }) => {
    throw redirect({ href: `/contact/index.html${location.searchStr ?? ""}` });
  },
});
