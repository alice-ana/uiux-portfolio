import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";

const pages = new Set([
  "index.html",
  "case-water.html",
  "case-sensmate.html",
  "case-linebot.html",
  "case-senslink.html",
  "case-remote.html",
  "case-chising.html",
]);

function bodyContents(html: string) {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return (match?.[1] ?? "").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

export default async function LegacyPortfolioPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!pages.has(page)) notFound();
  const html = await readFile(path.join(process.cwd(), "public", page), "utf8");
  const bodyClass = page === "index.html" ? "" : "case-story-page";

  return (
    <div
      className={bodyClass}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: bodyContents(html) }}
    />
  );
}
