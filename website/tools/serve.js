#!/usr/bin/env node
/**
 * Tiny static server that mimics Netlify's clean URLs.
 *   node tools/serve.js          → http://localhost:4173
 * Serves the built "public" folder. Build first:  node build.js
 */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "public");
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

function send(res, status, body, type, headers = {}) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-cache",
    ...headers,
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  } catch {
    return send(res, 400, "Bad request", "text/plain");
  }

  // Netlify-style: /about → /about/, /about/ → /about/index.html
  if (!path.extname(urlPath) && !urlPath.endsWith("/")) urlPath += "/";

  let file = path.join(ROOT, urlPath);
  if (!file.startsWith(ROOT)) return send(res, 403, "Forbidden", "text/plain");
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");

  if (!fs.existsSync(file)) {
    const notFound = path.join(ROOT, "404.html");
    if (fs.existsSync(notFound)) return send(res, 404, fs.readFileSync(notFound), MIME[".html"]);
    return send(res, 404, "Not found", "text/plain");
  }

  const type = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
  send(res, 200, fs.readFileSync(file), type);
});

server.listen(PORT, HOST, () => {
  console.log(`\n  Empire D Ltd — preview: http://localhost:${PORT}\n`);
});
