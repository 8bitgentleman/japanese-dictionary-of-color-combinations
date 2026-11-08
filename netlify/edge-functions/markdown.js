// Serves the pre-generated markdown twin of a page when the client asks for
// text/markdown. Static files (*.md, *.json, assets) are excluded in config.

const wantsMarkdown = (accept) => {
  const rank = (type) => {
    let best = -1;
    accept.split(",").forEach((part, i) => {
      const [t, ...params] = part.trim().split(";");
      if (t.trim().toLowerCase() !== type) return;
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? parseFloat(q.slice(2)) : 1;
      if (weight > 0 && best === -1) best = i;
    });
    return best;
  };
  const md = rank("text/markdown");
  const html = rank("text/html");
  return md !== -1 && (html === -1 || md < html);
};

const markdownPath = (pathname) => {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/") return "/index.md";
  if (/^\/(palettes|colors)\/[^/]+$/.test(p)) return `${p}.md`;
  return null;
};

export default async (request, context) => {
  const accept = request.headers.get("accept") || "";
  const target = wantsMarkdown(accept)
    ? markdownPath(new URL(request.url).pathname)
    : null;

  if (target) {
    const res = await context.rewrite(target);
    const type = res.headers.get("content-type") || "";
    if (res.ok && type.includes("markdown")) {
      const out = new Response(res.body, res);
      out.headers.set("Vary", "Accept");
      return out;
    }
  }

  const res = await context.next();
  res.headers.append("Vary", "Accept");
  return res;
};

export const config = {
  path: "/*",
  excludedPath: ["/static/*", "/*.*"],
};
