import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "img",
  "h2",
  "h3",
  "blockquote",
];

const ALLOWED_ATTR = ["src", "alt", "class"];

export function isProbablyHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

export function isRichTextEmpty(html: string): boolean {
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  const hasImage = /<img[\s>]/i.test(html);

  return text.length === 0 && !hasImage;
}

export function sanitizeTaskDescription(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}
