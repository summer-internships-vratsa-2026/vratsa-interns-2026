import sanitizeHtml from "sanitize-html";

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

const ALLOWED_ATTRIBUTES = Object.fromEntries(
  ALLOWED_TAGS.filter((tag) => tag !== "br").map((tag) => [
    tag,
    tag === "img" ? ["src", "alt", "class"] : ["class"],
  ]),
);

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
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
  });
}
