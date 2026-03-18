import { describe, it, expect } from 'vitest';
import { safeJsonStringify } from '../utils';

describe('safeJsonStringify', () => {
  it('safeJsonStringify_Should_EscapeEndScriptTag_WhenValueContainsLowerCaseEndScript', () => {
    const result = safeJsonStringify({ url: 'https://evil.example.com/</script><script>alert(1)</script>' });
    expect(result).not.toContain('</script');
    expect(result).toContain('<\\/script');
  });

  it('safeJsonStringify_Should_EscapeEndScriptTag_WhenValueContainsUpperCaseENDSCRIPT', () => {
    const result = safeJsonStringify({ url: '</SCRIPT>' });
    expect(result).not.toContain('</SCRIPT');
    expect(result).toContain('<\\/script');
  });

  it('safeJsonStringify_Should_EscapeEndScriptTag_WhenValueContainsMixedCaseEndScript', () => {
    const result = safeJsonStringify({ url: '</Script>' });
    expect(result).not.toContain('</Script');
    expect(result).toContain('<\\/script');
  });

  it('safeJsonStringify_Should_ProduceValidJson_WhenInputHasNoEndScriptSequence', () => {
    const input = { name: 'Dr. Anna de Vries', url: 'https://example.com' };
    const result = safeJsonStringify(input);
    expect(() => JSON.parse(result)).not.toThrow();
    expect(JSON.parse(result)).toEqual(input);
  });

  it('safeJsonStringify_Should_ProduceValidJson_WhenInputContainsEndScriptSequence', () => {
    const input = { sameAs: ['https://bigregister.nl/</script>'] };
    const result = safeJsonStringify(input);
    const parsed = JSON.parse(result) as typeof input;
    expect(parsed.sameAs[0]).toBe('https://bigregister.nl/</script>');
  });
});
