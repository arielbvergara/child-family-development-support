interface JsonLdProps {
  schema: Record<string, unknown>;
}

/**
 * Renders a JSON-LD structured-data <script> tag.
 *
 * JSON-LD scripts use type="application/ld+json" which marks them as data,
 * not executable JavaScript. Browsers do not execute them, so they are not
 * subject to the nonce check in script-src and do not require a nonce.
 * Omitting the nonce also avoids a React hydration mismatch — browsers strip
 * the nonce attribute from the DOM after use, causing server/client divergence.
 */
export function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
