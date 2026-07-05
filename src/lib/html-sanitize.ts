import sanitizeHtml from 'sanitize-html';

const allowedTags = [
  ...sanitizeHtml.defaults.allowedTags,
  'img',
  'h1',
  'h2',
  'h3',
  'figure',
  'figcaption',
  'video',
  'source',
];

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      a: ['href', 'name', 'target', 'rel'],
      video: ['src', 'controls', 'width', 'height'],
      source: ['src', 'type'],
      '*': ['class', 'id'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  });
}

export function optionalSanitizedHtml(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return sanitizeRichText(value);
}
