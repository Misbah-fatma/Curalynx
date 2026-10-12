/**
 * Strip full-document markup and global CSS/JS from product rich text.
 * Some product sections were saved as full HTML pages with <style> tags
 * that break the site navbar/layout when injected.
 */
export function sanitizeProductHtml(html) {
  if (!html || typeof html !== "string") return "";

  let content = html;

  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    content = bodyMatch[1];
  }

  content = content
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<\/?(?:html|head|body|meta|link|title|base)[^>]*>/gi, "")
    .replace(/\s*on\w+\s*=\s*(['"])[\s\S]*?\1/gi, "")
    .replace(/\s*on\w+\s*=\s*[^\s>]+/gi, "");

  return content.trim();
}
