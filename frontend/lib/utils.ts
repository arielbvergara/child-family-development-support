/**
 * Serializes a value to a JSON string that is safe to embed inside an HTML
 * <script> tag.
 *
 * `JSON.stringify` alone can produce the substring `</script` inside string
 * values, which would prematurely terminate the enclosing script tag and allow
 * content injection.  We escape every occurrence of `</script` (case-
 * insensitive, to cover `</SCRIPT`, `</Script`, etc.) to `<\/script` so the
 * JSON remains valid while the browser parser can no longer treat the sequence
 * as an end-tag.
 *
 * Reference: https://owasp.org/Top10/2025/A10_2025-Mishandling_of_Exceptional_Conditions/
 */
export function safeJsonStringify(value: unknown): string {
  return JSON.stringify(value).replace(/<\/script/gi, '<\\/script');
}
