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

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { page } = await searchParams;
  const file = typeof page === "string" ? page : "index.html";
  if (!pages.has(file)) notFound();

  const html = await readFile(path.join(process.cwd(), "public", file), "utf8");
  const bodyClass = file === "index.html" ? "" : "case-story-page";

  return (
    <div
      className={bodyClass}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: bodyContents(html) }}
    />
  );
}
