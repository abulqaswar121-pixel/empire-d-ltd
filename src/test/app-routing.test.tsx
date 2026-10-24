import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  // Every clean URL the static site links to must have a real route behind
  // it (each one redirects to its static page in /public); without these,
  // interior pages render the __root "Page not found" screen in the preview.
  it.each([
    "/about",
    "/about/",
    "/education",
    "/education/",
    "/logistics",
    "/logistics/",
    "/procurement",
    "/procurement/",
    "/contact",
    "/contact/",
    "/thank-you",
    "/thank-you/",
  ])("matches a page for %s instead of falling back to not found", (path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes(path);

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
