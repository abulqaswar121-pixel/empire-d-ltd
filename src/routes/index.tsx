import { createFileRoute, redirect } from "@tanstack/react-router";

// The Empire D Ltd website is a static site served from /public (copied from website/public).
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ href: "/home.html" });
  },
  head: () => ({
    meta: [
      { title: "Empire D Ltd | Education, Logistics & Procurement in Nigeria" },
      { name: "description", content: "Empire D Ltd: online education, logistics and general procurement across Nigeria." },
      { property: "og:title", content: "Empire D Ltd" },
      { property: "og:description", content: "Education, logistics and procurement across Nigeria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
